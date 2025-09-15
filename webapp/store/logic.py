import sys
import datetime
import json
from collections import OrderedDict
import re
import humanize
from dateutil import parser
from mistune import html
from canonicalwebteam.docstring_extractor import get_docstrings
from webapp.helpers import (
    discourse_api,
    get_yaml_loader,
    markdown_to_html,
    get_soup,
    modify_headers,
)
from webapp.observability.utils import trace_function

yaml = get_yaml_loader()

PLATFORMS = {
    "ubuntu": "Ubuntu",
    "centos": "CentOS",
}

ARCHITECTURES = ["amd64", "arm64", "ppc64el", "riscv64", "s390x"]


@trace_function
def get_summary(package):
    if package["type"] == "bundle":
        summary = (
            package.get("store_front", {})
            .get("bundle", {})
            .get("summary", None)
        )
    else:
        summary = (
            package.get("store_front", {})
            .get("metadata", {})
            .get("summary", None)
        )
    return summary


@trace_function
def get_description(package, parse_to_html=False):
    if package["type"] == "bundle":
        description = (
            package.get("store_front", {})
            .get("bundle", {})
            .get("description", None)
        )
    else:
        description = (
            package.get("store_front", {})
            .get("metadata", {})
            .get("description", None)
        )
    return markdown_to_html(description) if parse_to_html else description


@trace_function
def get_banner_url(media):
    """
    Get banner url from media object

    :param media: the media dictionnary
    :returns: the banner url
    """
    for m in media:
        if m["type"] == "banner":
            return m["url"]

    return None


@trace_function
def get_channel_map(channel_map):
    """
    Reformat channel map to return a channel map
    with unique risk

    :param channel_map: the channel map from the api
    :returns: the channel map reformatted
    """
    new_map = []
    for channel in channel_map:
        for res in new_map:
            if channel["channel"]["name"] == res["channel"]["name"]:
                break
        else:
            new_map.append(channel)

    return new_map


@trace_function
def convert_channel_maps(channel_map):
    """
    Converts channel maps list to format easier to manipulate

    :param channel_maps: The channel maps list returned by the API

    :returns: The channel maps reshaped
    """
    result = {}
    track_order = {"latest": 1}
    risk_order = {"stable": 1, "candidate": 2, "beta": 3, "edge": 4}
    for channel in channel_map:
        track = channel["channel"].get("track", "latest")
        risk = channel["channel"]["risk"]
        revision_number = channel["revision"]["revision"]

        if track not in result:
            result[track] = {}

        if risk not in result[track]:
            result[track][risk] = {"latest": None, "releases": {}}

        # same revision but for a different arch
        if revision_number in result[track][risk]["releases"]:
            arch = channel["channel"]["base"]["architecture"]

            if arch == "all":
                result[track][risk]["releases"][revision_number][
                    "architectures"
                ].update(ARCHITECTURES)
            else:
                result[track][risk]["releases"][revision_number][
                    "architectures"
                ].add(arch)
            continue

        info = {
            "released_at": channel["channel"]["released-at"],
            "release_date": convert_date(channel["channel"]["released-at"]),
            "version": channel["revision"]["version"],
            "channel": channel["channel"]["name"],
            "risk": channel["channel"]["risk"],
            "size": channel["revision"]["download"]["size"],
            "bases": extract_series(channel, True),
            "channel_bases": extract_bases(channel),
            "revision": process_revision(channel["revision"]),
            "architectures": set(),
        }

        if channel["channel"]["base"]:
            arch = channel["channel"]["base"]["architecture"]
            if arch == "all":
                info["architectures"].update(ARCHITECTURES)
            else:
                info["architectures"].add(arch)

        result[track][risk]["releases"][revision_number] = info

    # Order tracks (latest track first)
    result = OrderedDict(
        sorted(
            result.items(), key=lambda x: track_order.get(x[0], sys.maxsize)
        )
    )

    # Order risks (stable, candidate, beta, edge)
    for track, track_data in result.items():
        result[track] = OrderedDict(
            sorted(
                track_data.items(),
                key=lambda x: risk_order.get(x[0], sys.maxsize),
            )
        )

        # Order releases by revision
        for risk, data in result[track].items():
            result[track][risk]["releases"] = OrderedDict(
                sorted(
                    result[track][risk]["releases"].items(),
                    key=lambda release: release[1]["released_at"],
                    reverse=True,
                )
            )

            # Collect all the bases available across all releases

            base_names = sorted(
                list(
                    set(
                        base
                        for release in result[track][risk]["releases"].values()
                        for base in release["bases"]
                    )
                ),
                reverse=True,
            )

            result[track][risk]["all_bases"] = [
                {
                    "name": base,
                    "architectures": sorted(
                        list(
                            set(
                                arch
                                for release in result[track][risk][
                                    "releases"
                                ].values()
                                if base in release["bases"]
                                for arch in release["architectures"]
                            )
                        )
                    ),
                }
                for base in base_names
            ]

            result[track][risk]["latest"] = result[track][risk]["releases"][
                max(result[track][risk]["releases"].keys())
            ]
    return result


@trace_function
def process_revision(revision):
    bases = []

    for base in revision["bases"]:
        if base and base.get("architecture") == "all":
            for arch in ARCHITECTURES:
                bases.append({**base, "architecture": arch})
        else:
            bases.append(base)
    return {**revision, "bases": bases}


@trace_function
def extract_resources(channel):
    """
    Extract resources from channel map

    :param channel_maps: The channel maps list returned by the API

    :returns: Charm resource names
    """
    resources = []

    channel_resources = channel["resources"]

    for resource in channel_resources:
        resources.append(
            {"name": resource["name"], "revision": resource["revision"]}
        )

    return resources


@trace_function
def extract_default_release_architectures(channel):
    architectures = set()

    for base in channel["revision"]["bases"]:
        if not base or base["architecture"] in architectures:
            continue

        arch = base["architecture"]
        if arch == "all":
            architectures.update(ARCHITECTURES)
        else:
            architectures.add(arch)

    return sorted(architectures)


@trace_function
def extract_all_arch(channel_map, parent_dict):
    all_archy = set()
    all_channel_bases = {}
    platforms = {}

    for version_data in channel_map.values():
        channel_map_all = list(version_data.items())
        for _, channel_data in channel_map_all:
            for release in channel_data["releases"].values():
                all_archy = all_archy.union(release["architectures"])

                for base in release["channel_bases"]:
                    for series in base["channels"]:
                        platform = PLATFORMS.get(base["name"], base["name"])

                        if base["name"] not in platforms:
                            platforms[base["name"]] = set()
                        platforms[base["name"]].add(series)

                        all_channel_bases[base["name"] + series] = (
                            f"{platform} {series}"
                        )

    parent_dict["all_architectures"] = sorted(all_archy)
    parent_dict["all_platforms"] = platforms
    parent_dict["all_channel_bases"] = dict(
        sorted(all_channel_bases.items(), reverse=True)
    )

    return


@trace_function
def extract_series(channel, long_name=False):
    """
    Extract ubuntu series from channel map

    :param channel_maps: The channel maps list returned by the API

    :returns: Ubuntu series number
    """
    series = set()

    for base in channel["revision"]["bases"]:
        if not base or base["channel"] in series:
            continue
        platform = PLATFORMS.get(base["name"], base["name"])
        series.add(
            f"{platform} {base['channel']}" if long_name else base["channel"]
        )

    return sorted(series, reverse=True)


@trace_function
def extract_bases(channel):
    bases = channel["revision"]["bases"]
    channel_bases = []

    for i in bases:
        if i is None:
            return []

        has_base = False

        for b in channel_bases:
            if b["name"] == i["name"]:
                has_base = True

        if not has_base:
            channel_bases.append(
                {
                    "name": i["name"],
                    "channels": set(),
                }
            )

    for i in channel_bases:
        for b in bases:
            if b["name"] == i["name"]:
                i["channels"].add(b["channel"])

        i["channels"] = sorted(i["channels"], reverse=True)

    return channel_bases


@trace_function
def convert_date(date_to_convert):
    """
    Convert date to human readable format: Month Day Year

    If date is less than a day return: today or yesterday

    Format of date to convert: 2019-01-12T16:48:41.821037+00:00
    Output: Jan 12 2019

    :param date_to_convert: Date to convert
    :returns: Readable date
    """
    date_parsed = parser.parse(date_to_convert).replace(tzinfo=None)
    delta = datetime.datetime.now() - datetime.timedelta(days=1)
    if delta < date_parsed:
        return humanize.naturalday(date_parsed).title()
    else:
        return date_parsed.strftime("%d %b %Y")


@trace_function
def get_icons(package):
    media = package["result"]["media"]
    return [m["url"] for m in media if m["type"] == "icon"]


@trace_function
def get_docs_topic_id(metadata_yaml):
    """
    Return discourse topic ID or None
    """
    base_url = discourse_api.base_url
    docs_link = metadata_yaml.get("docs")

    if docs_link:
        if docs_link.startswith(base_url):
            docs_link_parts = docs_link[len(base_url) :].split("/")

            if len(docs_link_parts) > 2:
                topic_id = docs_link_parts[-1]

                if topic_id.isnumeric():
                    return topic_id

    return None


@trace_function
def convert_categories(api_categories):
    """
    The name property in the API response has a slug
    like format, e.g., big-data

    This method will return the desired name and an
    extra slug property with the value from the API
    """
    result = []

    for category in api_categories:
        category["slug"] = category["name"]
        category["name"] = format_slug(category["slug"])
        result.append(category)

    return result


@trace_function
def add_store_front_data(package, details=False):
    extra = {}

    extra["icons"] = get_icons(package)

    if package["result"]["deployable-on"]:
        extra["deployable-on"] = package["result"]["deployable-on"]
    else:
        extra["deployable-on"] = ["vm"]

    extra["categories"] = convert_categories(package["result"]["categories"])

    if "title" in package["result"] and package["result"]["title"]:
        extra["display-name"] = package["result"]["title"]
    else:
        extra["display-name"] = format_slug(package["name"])

    if details:
        extra["metadata"] = yaml.load(
            package["default-release"]["revision"]["metadata-yaml"]
        )
        extra["config"] = yaml.load(
            package["default-release"]["revision"]["config-yaml"]
        )
        extra["actions"] = yaml.load(
            package["default-release"]["revision"]["actions-yaml"]
        )

        if package["type"] == "bundle":
            extra["bundle"] = yaml.load(
                package["default-release"]["revision"]["bundle-yaml"]
            )

            # Get bundle docs
            extra["docs_topic"] = get_docs_topic_id(extra["bundle"])

            # List charms
            extra["bundle"]["charms"] = get_bundle_charms(
                extra["bundle"].get(
                    "applications", extra["bundle"].get("services")
                )
            )
        else:
            # Get charm docs
            extra["docs_topic"] = get_docs_topic_id(extra["metadata"])

        # Reshape channel maps
        extra["channel_map"] = convert_channel_maps(package["channel-map"])
        extra["resources"] = extract_resources(package["default-release"])

        # Extract all supported series
        extra["architectures"] = extract_default_release_architectures(
            package["default-release"]
        )
        # extract all architecture based on series
        extract_all_arch(extra["channel_map"], extra)
        extra["series"] = extract_series(package["default-release"])
        extra["channel_bases"] = extract_bases(package["default-release"])

        # Some needed fields
        extra["publisher_name"] = package["result"]["publisher"][
            "display-name"
        ]
        extra["username"] = package["result"]["publisher"]["username"]

        if "summary" in package["result"]:
            extra["summary"] = package["result"]["summary"]

        # Handle issues and website keys
        if "issues" in extra["metadata"]:
            if not isinstance(extra["metadata"]["issues"], list):
                extra["metadata"]["issues"] = [extra["metadata"]["issues"]]

        if "website" in extra["metadata"]:
            if not isinstance(extra["metadata"]["website"], list):
                extra["metadata"]["website"] = [extra["metadata"]["website"]]

    package["store_front"] = extra
    return package


@trace_function
def get_bundle_charms(charm_apps):
    result = []

    if charm_apps:
        for app_name, data in charm_apps.items():
            # Charm names could be with the old prefix/suffix
            # Like: cs:~charmed-osm/mariadb-k8s-35
            name = data["charm"]
            if name.startswith("cs:") or name.startswith("ch:"):
                name = re.match(r"(?:cs:|ch:)(?:.+/)?(\S*?)(?:-\d+)?$", name)[
                    1
                ]

            charm = {"title": format_slug(name), "name": name}

            result.append(charm)

    return result


@trace_function
def process_python_docs(library, module_name):
    """Process libraries response from the API
    to generate the HTML output"""

    # Obtain Python docstrings
    docstrings = get_docstrings(library["content"], module_name)

    bs_soup = get_soup(html(docstrings["docstring_text"]))
    docstrings["html"] = modify_headers(bs_soup, 3)

    return docstrings


@trace_function
def process_libraries(libraries):
    """Process the libraries response from the API"""

    result = []

    for lib in libraries["libraries"]:
        data = {
            "id": lib["library-id"],
            "name": lib["library-name"],
            "hash": lib["hash"],
            "created_at": lib["created-at"],
        }

        result.append(data)

    return result


@trace_function
def get_library(library_name, libraries):
    library = next(
        (lib for lib in libraries if lib.get("name") == library_name),
        None,
    )

    if not library:
        return None

    return library["id"]


@trace_function
def filter_charm(charm, categories=["all"], base="all"):
    """
    This filter will be done in the API soon.
    :returns: boolean
    """
    # When all is present there is no need to filter
    if categories and "all" not in categories:
        charm_categories = [
            cat["slug"] for cat in charm["store_front"]["categories"]
        ]

        if not any(x in categories for x in charm_categories):
            return False

    # Filter platforms
    if base != "all" and base not in charm["store_front"]["base"]:
        return False

    return True


@trace_function
def format_slug(slug):
    """Format slug name into a standard title format
    :param slug: The hypen spaced, lowercase slug to be formatted
    :return: The formatted string
    """

    return (
        slug.title()
        .replace("-", " ")
        .replace("_", " ")
        .replace("And", "and")
        .replace("Iot", "IoT")
    )


with open("webapp/store/overlay.json") as overlay_file:
    overlay = json.load(overlay_file)


@trace_function
def add_overlay_data(package):
    """
    Adds custom hard-coded overlay.json data to the package object
    :param package: The package object retrieved from the snapcraft API
    :return: The package object with an additional "overlay" key
    containing extra info
    """

    if overlay.get(package["name"]) is not None:
        package["overlay_data"] = overlay[package["name"]].copy()

    return package


@trace_function
def get_doc_link(package):
    """
    Returns the documentation link of a package
    """
    docs = package.get("store_front", {}).get("metadata", {}).get("docs", None)
    return docs
