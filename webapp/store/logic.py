import sys
import datetime
from collections import OrderedDict

import humanize
from dateutil import parser
from webapp.helpers import format_slug, get_yaml_loader, md_parser
from webapp.store.mock import mocked_actions
from docstring_extractor import get_docstrings
from webapp.helpers import increase_headers

yaml = get_yaml_loader()
UBUNTU_SERIES = {
    "warty": "4.10",
    "hoary": "5.04",
    "breezy": "5.10",
    "dapper": "6.06 LTS",
    "edgy": "6.10",
    "feisty": "7.04",
    "gutsy": "7.10",
    "hardy": "8.04 LTS",
    "intrepid": "8.10",
    "jaunty": "9.04",
    "karmic": "9.10",
    "lucid": "10.04 LTS",
    "maverick": "10.10",
    "natty": "11.04",
    "oneiric": "11.10",
    "precise": "12.04 LTS",
    "quantal": "12.10",
    "raring": "13.04",
    "saucy": "13.10",
    "trusty": "14.04 LTS",
    "utopic": "14.10",
    "vivid": "15.04",
    "wily": "15.10",
    "xenial": "16.04 LTS",
    "yakkety": "16.10",
    "zesty": "17.04",
    "artful": "17.10",
    "bionic": "18.04 LTS",
    "cosmic": "18.10",
    "disco": "19.04",
    "eoan": "19.10",
    "focal": "20.04 LTS",
    "groovy": "20.10",
}

CATEGORIES = {
    "ai_ml": "ai/ml",
    "ai": "ai/ml",
    "machine_learning": "ai/ml",
    "fortran": "logging-and-tracing",
    "ldap": "logging-and-tracing",
    "nginx": "logging-and-tracing",
    "telemetry": "logging-and-tracing",
    "system": "logging-and-tracing",
    "lsf_server": "logging-and-tracing",
    "ops": "monitoring",
    "monitoring": "monitoring",
    "reporting": "monitoring",
    "cpu": "monitoring",
    "deploy": "monitoring",
    "prometheus": "monitoring",
    "workload_management": "monitoring",
    "ops, monitoring": "monitoring",
    "job_scheduler": "monitoring",
    "network": "networking",
    "content_cache": "networking",
    "networking": "networking",
    "dns": "networking",
    "cache_proxy": "networking",
    "reverse_proxy": "networking",
    "big_data": "big-data",
    "bigdata": "big-data",
    "tensorflow": "big-data",
    "hadoop": "big-data",
    "ampq": "big-data",
    "analytics": "big-data",
    "social": "big-data",
    "kubernetes": "Kubernetes",
    "controllers": "Kubernetes",
    "kubeflow": "Kubernetes",
    "containers": "Kubernetes",
    "authentication": "security",
    "identity": "security",
    "security": "security",
    "app-servers": "storage",
    "web-server": "storage",
    "file-servers": "storage",
    "storage": "storage",
    "ftp": "storage",
    "file-server": "storage",
    "capacity-planning": "storage",
    "openstack": "openstack",
    "infrastructure": "openstack",
    "keystore": "openstack",
    "databases": "database",
    "database": "database",
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
        resources = {}

        for resource in channel["revision"]["resources"]:
            resources[resource["name"]] = resource

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
            "platform": convert_series_to_ubuntu_versions(
                channel["channel"]["platform"]["series"]
            ),
            "resources": resources,
        }

        result[track][risk].append(info)

    # Order tracks and risks
    result = OrderedDict(
        sorted(
            result.items(), key=lambda x: track_order.get(x[0], sys.maxsize)
        )
    )

    for track, track_data in result.items():
        result[track] = OrderedDict(
            sorted(
                track_data.items(),
                key=lambda x: risk_order.get(x[0], sys.maxsize),
            )
        )

    return result


def mock_resources(package):
    fake_resources = [
        {
            "name": "resource1",
            "type": "resource-type",
            "revision": "3",
            "path": "resource-path",
            "filesize": "resource-filesize",
            "sha256": "resource-sha256",
            "sha512": "resource-sha512",
            "sha384": "resource-sha384",
            "download_url": "resource-download-url",
        },
        {
            "name": "resource2",
            "type": "resource-type",
            "revision": "4",
            "path": "resource-path",
            "filesize": "resource-filesize",
            "sha256": "resource-sha256",
            "sha512": "resource-sha512",
            "sha384": "resource-sha384",
            "download_url": "resource-download-url",
        },
    ]

    for channel in package["channel-map"]:
        channel["revision"]["resources"] = fake_resources

    return package


def extract_all_resources(channel_map):
    """
    Extract resources from channel map

    :param channel_maps: The channel maps list returned by the API

    :returns: Charm resource names
    """
    resources = []

    for channel in channel_map:

        channel_resources = channel["revision"]["resources"]

        for resource in channel_resources:
            if resource["name"] not in resources:
                resources.append(resource["name"])

    return resources


def extract_all_series(channel_map):
    """
    Extract ubuntu series from channel map

    :param channel_maps: The channel maps list returned by the API

    :returns: Ubuntu series
    """
    series = []

    for channel in channel_map:
        channel_series = channel["channel"]["platform"]["series"]
        if channel_series not in series:
            series.append(channel_series)

    return series


def convert_series_to_ubuntu_versions(series):
    """Return Ubuntu version based on code name series

    Args:
        series (str|list): Ubuntu series

    Returns:
        str|list: Ubuntu version
    """
    if isinstance(series, str):
        return UBUNTU_SERIES.get(series, series.capitalize())
    elif isinstance(series, list):
        result = []
        for s in series:
            result.append(convert_series_to_ubuntu_versions(s))
    else:
        raise TypeError("Invalid series object")

    # Order from greater to lower version
    return sorted(result, reverse=True)


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
        return date_parsed.strftime("%-d %B %Y")


def get_icons(package):
    media = package["result"]["media"]
    return [m["url"] for m in media if m["type"] == "icon"]


def get_categories(categories_json):
    """Retrieve and flatten the nested array from the legacy API response.
    :param categories_json: The returned json
    :returns: A list of categories
    """

    categories = []
    i = 0

    for category in categories_json:
        mapped_catgory = CATEGORIES.get(category["name"], "other")
        # This is a hack to show only one category that is different
        # than other if it exists. Otherwise show other.
        if i < len(categories_json) - 1:
            if not mapped_catgory == "other":
                categories.append(
                    {
                        "slug": mapped_catgory,
                        "name": format_slug(mapped_catgory),
                    }
                )
                return categories
        else:
            categories.append(
                {
                    "slug": mapped_catgory,
                    "name": format_slug(mapped_catgory),
                }
            )
            return categories
        i = i + 1


def add_store_front_data(package):
    extra = {}

    # Mocked data
    package = mock_resources(package)
    extra["actions"] = mocked_actions
    extra["has_libraries"] = True

    extra["icons"] = get_icons(package)
    extra["metadata"] = yaml.load(
        package["default-release"]["revision"]["metadata-yaml"]
    )
    extra["config"] = yaml.load(
        package["default-release"]["revision"]["config-yaml"]
    )

    extra["categories"] = get_categories(package["result"]["categories"])

    # Reshape channel maps
    extra["channel_map"] = convert_channel_maps(package["channel-map"])
    extra["resources"] = extract_all_resources(package["channel-map"])

    # Extract all supported series
    extra["series"] = extract_all_series(package["channel-map"])

    # Some needed fields
    extra["publisher_name"] = package["result"]["publisher"]["display-name"]
    extra["last_release"] = convert_date(
        package["default-release"]["channel"]["released-at"]
    )
    extra["summary"] = package["result"]["summary"]
    extra["ubuntu_versions"] = convert_series_to_ubuntu_versions(
        extra["series"]
    )

    package["store_front"] = extra
    return package


def process_python_docs(library, module_name):
    """Process libraries response from the API
    to generate the HTML output"""

    # Obtain Python docstrings
    docstrings = get_docstrings(library["content"], module_name)

    docstrings["html"] = increase_headers(
        md_parser(docstrings["docstring"]), 3
    )

    # We support markdown inside docstrings (2 levels)
    for py_part in docstrings["content"]:
        py_part["html"] = increase_headers(md_parser(py_part["docstring"]), 3)

        for py_part_2 in py_part["content"]:
            py_part_2["html"] = increase_headers(
                md_parser(py_part_2["docstring"]), 3
            )

    return docstrings
