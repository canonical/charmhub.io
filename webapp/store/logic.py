import sys
import datetime
from collections import OrderedDict
import re
import humanize
from dateutil import parser
from canonicalwebteam.docstring_extractor import get_docstrings
from webapp.helpers import decrease_headers
from webapp.helpers import (
    discourse_api,
    get_yaml_loader,
    md_parser,
)

yaml = get_yaml_loader()

PLATFORMS = {
    "ubuntu": "Ubuntu",
    "centos": "CentOS",
}


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

        if track not in result:
            result[track] = {}

        if risk not in result[track]:
            result[track][risk] = []

        info = {
            "released_at": convert_date(channel["channel"]["released-at"]),
            "version": channel["revision"]["version"],
            "channel": channel["channel"]["name"],
            "risk": channel["channel"]["risk"],
            "size": channel["revision"]["download"]["size"],
            "bases": extract_series(channel, True),
            "channel_bases": extract_bases(channel),
            "revision": channel["revision"],
        }

        if channel["channel"]["base"]:
            info["architecture"] = channel["channel"]["base"]["architecture"]

        result[track][risk].append(info)

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
    for risk, releases in result[track].items():
        result[track][risk] = sorted(
            releases,
            key=lambda k: int(k["revision"]["revision"]),
            reverse=True,
        )

    return result


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


def extract_series(channel, long_name=False):
    """
    Extract ubuntu series from channel map

    :param channel_maps: The channel maps list returned by the API

    :returns: Ubuntu series number
    """
    series = []

    for base in channel["revision"]["bases"]:
        if not base or base["channel"] in series:
            continue
        platform = PLATFORMS.get(base["name"], base["name"])
        series.append(
            f"{platform} {base['channel']}" if long_name else base["channel"]
        )

    return sorted(series, reverse=True)


def extract_bases(channel):
    bases = channel["revision"]["bases"]
    channel_bases = []

    for i in bases:
        has_base = False

        for b in channel_bases:
            if b["name"] == i["name"]:
                has_base = True

        if not has_base:
            channel_bases.append(
                {
                    "name": i["name"],
                    "channels": [],
                }
            )

    for i in channel_bases:
        for b in bases:
            if b["name"] == i["name"]:
                i["channels"].append(b["channel"])

    return channel_bases


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


def get_icons(package):
    media = package["result"]["media"]
    return [m["url"] for m in media if m["type"] == "icon"]


def get_docs_topic_id(metadata_yaml):
    """
    Return discourse topic ID or None
    """
    base_url = discourse_api.base_url
    docs_link = metadata_yaml.get("docs")

    if docs_link:
        if docs_link.startswith(base_url):
            docs_link_parts = docs_link[len(base_url) :].split("/")

            if len(docs_link_parts) > 3:
                topic_id = docs_link_parts[3]

                if topic_id.isnumeric():
                    return topic_id

    return None


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


def add_store_front_data(package, details=False):
    extra = {}

    extra["icons"] = get_icons(package)

    if package["result"]["deployable-on"]:
        extra["deployable-on"] = package["result"]["deployable-on"]
    else:
        extra["deployable-on"] = ["linux"]

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
        extra["series"] = extract_series(package["default-release"])
        extra["channel_bases"] = extract_bases(package["default-release"])

        # Some needed fields
        extra["publisher_name"] = package["result"]["publisher"][
            "display-name"
        ]

        if "summary" in package["result"]:
            extra["summary"] = package["result"]["summary"]

    package["store_front"] = extra
    return package


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


def process_python_docs(library, module_name):
    """Process libraries response from the API
    to generate the HTML output"""

    # Obtain Python docstrings
    docstrings = get_docstrings(library["content"], module_name)

    docstrings["html"] = decrease_headers(
        md_parser(docstrings["docstring_text"]), 3
    )

    return docstrings


def process_libraries(libraries):
    """Process the libraries response from the API"""

    result = {}

    for lib in libraries["libraries"]:
        lib_parts = lib["library-name"].split(".")

        if len(lib_parts) > 2:
            group_name = ".".join(lib_parts[:-2])
            lib_name = "." + ".".join(lib_parts[-2:])
        else:
            group_name = "others"
            lib_name = lib["library-name"]

        data = {
            "id": lib["library-id"],
            "name": lib_name,
            "hash": lib["hash"],
            "created_at": lib["created-at"],
        }

        if group_name in result:
            result[group_name].append(data)
        else:
            result[group_name] = [data]

    return result


def get_library(library_name, libraries):
    lib_parts = library_name.split(".")

    if len(lib_parts) > 2:
        group_name = ".".join(lib_parts[:-2])
        lib_name = "." + ".".join(lib_parts[-2:])
    else:
        group_name = "others"
        lib_name = library_name

    library = next(
        (
            lib
            for lib in libraries.get(group_name, {})
            if lib.get("name") == lib_name
        ),
        None,
    )

    if not library:
        return None

    return library["id"]


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
