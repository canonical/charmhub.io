import re

import yaml

from flask import make_response
from typing import List, Dict, TypedDict, Any, Union

from canonicalwebteam.exceptions import StoreApiError
from cache.cache_utility import redis_cache
from webapp.observability.utils import trace_function
from webapp.store.logic import format_slug
from webapp.store_api import publisher_gateway


Packages = TypedDict(
    "Packages",
    {
        "packages": List[
            Dict[
                str,
                Union[Dict[str, Union[str, List[str]]], List[Dict[str, str]]],
            ]
        ]
    },
)

Package = TypedDict(
    "Package",
    {
        "package": Dict[
            str, Union[Dict[str, str], List[str], List[Dict[str, str]]]
        ]
    },
)


@trace_function
def get_icon(media):
    icons = [m["url"] for m in media if m["type"] == "icon"]
    if len(icons) > 0:
        return icons[0]
    return ""


@trace_function
def fetch_packages(fields: List[str], query_params: Dict[str, Any], libraries: bool = False) -> Packages:
    """
    Fetches packages from the store API based on the specified fields and parse the packages.

    :param: fields (List[str]): A list of fields to include in the package
    data.
    :param: query_params: A search query

    :returns: a dictionary containing the list of parsed packages.
    """

    category = query_params.get("categories", "")
    query = query_params.get("q", "")
    package_type = query_params.get("type", None)
    platform = query_params.get("platforms", "")
    architecture = query_params.get("architecture", "")
    provides = query_params.get("provides", None)
    requires = query_params.get("requires", None)

    if package_type == "all":
        package_type = None

    args = {
        "category": category,
        "fields": fields,
        "query": query,
    }

    if package_type:
        args["type"] = package_type

    if provides:
        provides = provides.split(",")
        args["provides"] = provides

    if requires:
        requires = requires.split(",")
        args["requires"] = requires

    parts = ["fetch-packages"]
    if category:
        parts.append(f"cat-{category}")
    if query:
        parts.append(f"query-{query}")
    if platform:
        parts.append(f"plat-{platform}")
    if architecture:
        parts.append(f"arch-{architecture}")
    if package_type:
        parts.append(f"type-{package_type}")
    if libraries:
        parts.append(f"lib-{libraries}")

    key = ":".join(parts)
    result = redis_cache.get(key, expected_type=dict)
    if not result:
        packages = publisher_gateway.find(**args).get("results", [])
        if platform and platform != "all":
            filtered_packages = []
            for p in packages:
                platforms = p["result"].get("deployable-on", [])
                if not platforms:
                    platforms = ["vm"]
                if platform in platforms:
                    filtered_packages.append(p)
            packages = filtered_packages

        if architecture and architecture != "all":
            args["architecture"] = architecture
            packages = publisher_gateway.find(**args).get("results", [])

        result = [
            parse_package_for_card(package, libraries) for package in packages
        ]
        redis_cache.set(key, result, ttl=600)

    return {"data": result}


@trace_function
def fetch_package(package_name: str, fields: List[str]) -> Package:
    """
    Fetches a package from the store API based on the specified package name.

    :param: package_name (str): The name of the package to fetch.
    :param: fields (List[str]): A list of fields to include in the package

    :returns: a dictionary containing the fetched package.
    """
    package = publisher_gateway.get_item_details(
        name=package_name,
        fields=fields,
        api_version=2,
    )
    response = make_response({"package": package})
    response.cache_control.max_age = 3600
    return response.json


@trace_function
def get_bundle_charms(charm_apps):
    result = []

    if charm_apps:
        for _, data in charm_apps.items():
            # Charm names could be with the old prefix/suffix
            # Like: cs:~charmed-osm/mariadb-k8s-35
            name = data["charm"]
            if name.startswith("cs:") or name.startswith("ch:"):
                name = re.match(r"(?:cs:|ch:)(?:.+/)?(\S*?)(?:-\d+)?$", name)[
                    1
                ]

            charm = {"display_name": format_slug(name), "name": name}

            result.append(charm)

    return result


@trace_function
def parse_package_for_card(
    package: Dict[str, Any],
    libraries: bool = False,
) -> Package:
    """
    Parses a package (charm, or bundle) and returns the formatted package
    based on the given card schema.

    :param: package (Dict[str, Any]): The package to be parsed.
    :returns: a dictionary containing the formatted package.

    note:
        - This function has to be refactored to be more generic,
        so we won't have to check for the package type before parsing.

    """
    resp = {
        "package": {
            "description": "",
            "display_name": "",
            "icon_url": "",
            "name": "",
            "platforms": [],
            "type": "",
            "channel": {
                "name": "",
                "risk": "",
                "track": "",
            },
        },
        "publisher": {"display_name": "", "name": "", "validation": ""},
        "categories": [],
        # hardcoded temporarily until we have this data from the API
        "ratings": {"value": "0", "count": "0"},
    }

    result = package.get("result", {})
    publisher = result.get("publisher", {})
    channel = package.get("default-release", {}).get("channel", {})
    risk = channel.get("risk", "")
    track = channel.get("track", "")
    if libraries:
        resp["package"]["libraries"] = publisher_gateway.get_charm_libraries(
            package["name"]
        ).get("libraries", [])
    resp["package"]["type"] = package.get("type", "")
    resp["package"]["name"] = package.get("name", "")
    resp["package"]["description"] = result.get("summary", "")
    resp["package"]["display_name"] = result.get(
        "title", format_slug(package.get("name", ""))
    )
    resp["package"]["channel"]["risk"] = risk
    resp["package"]["channel"]["track"] = track
    resp["package"]["channel"]["name"] = f"{track}/{risk}"
    resp["publisher"]["display_name"] = publisher.get("display-name", "")
    resp["publisher"]["validation"] = publisher.get("validation", "")
    resp["categories"] = result.get("categories", [])
    resp["package"]["icon_url"] = get_icon(result.get("media", []))

    platforms = result.get("deployable-on", [])
    if platforms:
        resp["package"]["platforms"] = platforms
    else:
        resp["package"]["platforms"] = ["vm"]

    if resp["package"]["type"] == "bundle":
        name = package["name"]
        default_release = publisher_gateway.get_item_details(
            name, fields=["default-release"]
        )
        bundle_yaml = default_release["default-release"]["revision"][
            "bundle-yaml"
        ]

        bundle_details = yaml.load(bundle_yaml, Loader=yaml.FullLoader)
        bundle_charms = get_bundle_charms(
            bundle_details.get(
                "applications", bundle_details.get("services", [])
            )
        )
        resp["package"]["charms"] = bundle_charms

    return resp


@trace_function
def paginate(
    packages: List[Packages], page: int, size: int, total_pages: int
) -> List[Packages]:
    """
    Paginates a list of packages based on the specified page and size.

    :param: packages (List[Packages]): The list of packages to paginate.
    :param: page (int): The current page number.
    :param: size (int): The number of packages to include in each page.
    :param: total_pages (int): The total number of pages.
    :returns: a list of paginated packages.

    note:
        - If the provided page exceeds the total number of pages, the last
        page will be returned.
        - If the provided page is less than 1, the first page will be returned.
    """

    if page > total_pages:
        page = total_pages
    if page < 1:
        page = 1

    start = (page - 1) * size
    end = start + size
    if end > len(packages):
        end = len(packages)

    return packages[start:end]


@trace_function
def get_packages(
    libraries: bool,
    fields: List[str],
    size: int = 10,
    query_params: Dict[str, Any] = {},
) -> List[Dict[str, Any]]:
    """
    Retrieves a list of packages from the store based on the specified
    parameters.The returned packages are paginated and parsed using the
    card schema.

    :param: store: The store object.
    :param: fields (List[str]): A list of fields to include in the
            package data.
    :param: size (int, optional): The number of packages to include
            in each page. Defaults to 10.
    :param: page (int, optional): The current page number. Defaults to 1.
    :param: query (str, optional): The search query.
    :param: filters (Dict, optional): The filter parameters. Defaults to {}.
    :returns: a dictionary containing the list of parsed packages and
            the total pages
    """

    packages = fetch_packages(fields, query_params, libraries).get("data", [])

    total_pages = -(len(packages) // -size)

    total_pages = -(len(packages) // -size)
    total_items = len(packages)
    page = int(query_params.get("page", 1))

    res = paginate(packages, page, size, total_pages)

    categories = get_store_categories()

    return {
        "packages": res,
        "total_pages": total_pages,
        "total_items": total_items,
        "categories": categories,
    }


@trace_function
def get_store_categories() -> List[Dict[str, str]]:
    """
    Fetches all store categories.

    :param: api_gw: The API object used to fetch the categories.
    :returns: A list of categories in the format:
    [{"name": "Category", "slug": "category"}]
    """
    key = "store-categories"
    categories = redis_cache.get(key, expected_type=list)
    if not categories:
        try:
            all_categories = publisher_gateway.get_categories()
        except StoreApiError:
            all_categories = []

        for cat in all_categories["categories"]:
            cat["display_name"] = format_slug(cat["name"])

        categories = list(
            filter(
                lambda cat: cat["name"] != "featured", all_categories["categories"]
            )
        )
        redis_cache.set(key, categories, ttl=3600)
    return categories


@trace_function
def get_package(
    package_name: str,
    fields: List[str],
    libraries: bool,
) -> Package:
    """Get a package by name

    :param store: The store object.
    :param store_name: The name of the store.
    :param package_name: The name of the package.
    :param fields: The fields to fetch.

    :return: A dictionary containing the package.
    """

    key = (
        f"get-package:{package_name}:lib-{libraries}"
        if libraries
        else f"get-package:{package_name}"
    )
    resp = redis_cache.get(key, expected_type=dict)
    if not resp:
        package = fetch_package(package_name, fields).get("package", {})
        resp = parse_package_for_card(package, libraries)
        redis_cache.set(key, resp, ttl=600)

    return {"package": resp}
