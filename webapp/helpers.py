import datetime
import re
import json
import os

from bs4 import BeautifulSoup
from mistune import Markdown, Renderer
import humanize
from canonicalwebteam.discourse import DiscourseAPI
from dateutil import parser
from flask import request
from ruamel.yaml import YAML
from talisker import requests

DISCOURSE_API_KEY = os.getenv("DISCOURSE_API_KEY")
DISCOURSE_API_USERNAME = os.getenv("DISCOURSE_API_USERNAME")


session = requests.get_session()
discourse_api = DiscourseAPI(
    base_url="https://discourse.juju.is/",
    session=session,
    api_key=DISCOURSE_API_KEY,
    api_username=DISCOURSE_API_USERNAME,
)

_yaml = YAML(typ="rt")
_yaml_safe = YAML(typ="safe")

md_parser = Markdown(renderer=Renderer())


def get_yaml_loader(typ="safe"):
    if typ == "safe":
        return _yaml_safe
    return _yaml


def split_filters(filters):
    filter_params = {}

    for charm_filter in filters:
        if charm_filter not in filter_params:
            filter_params[charm_filter] = []

        filter_params[charm_filter] += filters[charm_filter].split(",")

    return filter_params


def join_filters(filters):
    filter_string = []

    for filter_type in filters:
        if len(filters[filter_type]) > 0:
            filter_type_filters = ",".join(filters[filter_type])
            filter_string.append(f"{filter_type}={filter_type_filters}")

    if len(filter_string) == 0:
        filter_string = ""
    elif len(filter_string) == 1:
        filter_string = f"?{filter_string[0]}"
    else:
        filter_string = f"?{'&'.join(filter_string)}"

    return filter_string


def add_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    new_filters = filters.copy()
    if filter_type not in new_filters:
        new_filters[filter_type] = [filter_name]
    elif filter_name not in new_filters[filter_type]:
        new_filters[filter_type].append(filter_name)

    return join_filters(new_filters)


def remove_filter(filter_type, filter_name):
    filters = split_filters(request.args)
    new_filters = filters.copy()
    if filter_type in new_filters and filter_name in filters[filter_type]:
        new_filters[filter_type].remove(filter_name)

    return join_filters(new_filters)


def active_filter(filter_type, filter_name):
    # If there is no sorting selected fallback to the default one
    # (e.g. featured)
    if (
        not request.args
        and filter_type == "sort"
        and filter_name == "featured"
    ):
        return True

    filters = split_filters(request.args)
    if filter_type in filters and filter_name in filters[filter_type]:
        return True

    return False


def format_slug(slug):
    """Format slug name into a standard title format
    :param slug: The hypen spaced, lowercase slug to be formatted
    :return: The formatted string
    """
    # TODO Remove once we have category on store side
    if slug.lower() == "ai/ml":
        return slug.upper()
    if slug.lower() == "openstack":
        return "OpenStack"

    return (
        slug.title()
        .replace("-", " ")
        .replace("_", " ")
        .replace("And", "and")
        .replace("Iot", "IoT")
    )


def convert_date(date_to_convert):
    """Convert date to human readable format: Month Day Year
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


def is_safe_url(url):
    """
    Return True if the URL is inside the same app
    """
    return url.startswith(request.url_root) or url.startswith("/")


def get_licenses():
    try:
        with open("webapp/store-licenses.json") as f:
            licenses = json.load(f)

        def _build_custom_license(license_id, license_name):
            return {"licenseId": license_id, "name": license_name}

        CUSTOM_LICENSES = [
            _build_custom_license("Proprietary", "Proprietary"),
            _build_custom_license("Other Open Source", "Other Open Source"),
            _build_custom_license(
                "AGPL-3.0+", "GNU Affero General Public License v3.0 or later"
            ),
            _build_custom_license(
                "GPL-2.0+", "GNU General Public License v2.0 or later"
            ),
            _build_custom_license(
                "GPL-3.0+", "GNU General Public License v3.0 or later"
            ),
            _build_custom_license(
                "LGPL-2.1+", "GNU Lesser General Public License v2.1 or later"
            ),
            _build_custom_license(
                "LGPL-3.0+", "GNU Lesser General Public License v3.0 or later"
            ),
        ]

        licenses = licenses + CUSTOM_LICENSES
    except Exception:
        licenses = []

    return licenses


def increase_headers(html_content, step=2):
    soup = BeautifulSoup(html_content, features="html.parser")

    # Change all the headers (if step=2: eg h1 => h3)
    for h in soup.find_all(re.compile("^h[1-6]$")):
        level = int(h.name[1:]) + step
        if level > 6:
            level = 6
        h.name = f"h{str(level)}"

    return soup
