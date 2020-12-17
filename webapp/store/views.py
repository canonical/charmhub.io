import re

import talisker
from canonicalwebteam.discourse import DocParser
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from flask import Blueprint, abort
from flask import current_app as app
from flask import render_template, request, Response

from webapp.config import DETAILS_VIEW_REGEX
from webapp.decorators import (
    store_maintenance,
    redirect_uppercase_to_lowercase,
)
from webapp.feature import COMMANDS_OVERWRITE, FEATURED_CHARMS
from webapp.helpers import discourse_api, decrease_headers, md_parser
from webapp.store import logic

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static"
)
publisher_api = CharmPublisher(talisker.requests.get_session())

SEARCH_FIELDS = [
    "result.categories",
    "result.summary",
    "result.media",
    "result.publisher.display-name",
    "default-release.revision.revision",
    "default-release.revision.platforms",
    "default-release.channel",
]

CATEGORIES = [
    {"slug": "ai/ml", "name": "AI/ML"},
    {"slug": "big-data", "name": "Big Data"},
    {"slug": "database", "name": "Database"},
    {"slug": "cloud", "name": "Cloud"},
    {"slug": "containers", "name": "Containers"},
    {"slug": "featured", "name": "Featured"},
    {"slug": "logging-and-tracing", "name": "Logging and Tracing"},
    {"slug": "monitoring", "name": "Monitoring"},
    {"slug": "networking", "name": "Networking"},
    {"slug": "other", "name": "Other"},
    {"slug": "security", "name": "Security"},
    {"slug": "storage", "name": "Storage"},
]


@store.route("/")
@store_maintenance
def index():
    query = request.args.get("q", default=None, type=str)

    context = {
        "categories": CATEGORIES,
        "featured_charms": FEATURED_CHARMS,
    }

    if query:
        results = app.store_api.find(
            query=query.lower(), fields=SEARCH_FIELDS
        ).get("results")

        charms = []
        total_charms = 0

        for i, item in enumerate(results):
            if item["type"] != "charm":
                continue

            total_charms += 1

            charm = logic.add_store_front_data(
                results[i], results[i]["default-release"]
            )

            charms.append(charm)

        context["results"] = charms
        return render_template("store-search.html", **context)

    return render_template("store.html", **context)


@store.route("/charms.json")
def get_charms():
    query = request.args.get("q", default=None, type=str)

    if query:
        results = app.store_api.find(query=query, fields=SEARCH_FIELDS).get(
            "results"
        )
    else:
        results = app.store_api.find(fields=SEARCH_FIELDS).get("results", [])

    charms = []
    total_charms = 0

    for i, item in enumerate(results):
        if item["type"] != "charm":
            continue

        total_charms += 1

        charm = logic.add_store_front_data(
            results[i], results[i]["default-release"]
        )

        charms.append(charm)

    return {
        "charms": sorted(charms, key=lambda c: c["name"]),
        "q": query,
        "size": total_charms,
    }


FIELDS = [
    "result.media",
    "default-release",
    "result.categories",
    "result.publisher.display-name",
    "channel-map",
]

# TODO This is a temporary fix for release
# Store will release a field to flag if a charm needs the
# prefix cs:
# CS is the list of charms that don't need prefix "cs:"
CS = []


def get_package(entity_name, channel_request, fields):
    # Get entity info from API
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)

    if COMMANDS_OVERWRITE.get(entity_name):
        package["command"] = COMMANDS_OVERWRITE[entity_name]
    else:
        package["command"] = entity_name

    channel_selected = logic.get_current_channel(
        package["channel-map"], channel_request
    )

    if not channel_selected:
        channel_selected = package["default-release"]

    package = logic.add_store_front_data(package, channel_selected, True)
    package["channel_selected"] = channel_selected

    if package["name"] not in CS:
        package["cs"] = True

    for channel in package["channel-map"]:
        channel["channel"]["released-at"] = logic.convert_date(
            channel["channel"]["released-at"]
        )

    return package


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_overview(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)

    print(FIELDS)
    package = get_package(
        entity_name,
        channel_request,
        FIELDS.copy().extend(
            [
                "default-release.revision.readme-md",
                "result.summary",
                "channel-map.revision.readme-md",
            ]
        ),
    )

    readme = package["channel_selected"]["revision"].get(
        "readme-md", "No readme available"
    )

    # Remove Markdown comments
    readme = re.sub("(<!--.*-->)", "", readme, flags=re.DOTALL)

    readme = md_parser(readme)
    readme = decrease_headers(readme)

    return render_template(
        "details/overview.html",
        package=package,
        readme=readme,
        package_type=package["type"],
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs')
@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs/<slug>')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_docs(entity_name, slug=None):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(
        entity_name,
        channel_request,
        FIELDS.copy().extend(
            [
                "channel-map.revision.metadata-yaml",
                "default-release.revision.metadata-yaml",
            ]
        ),
    )

    if not package["store_front"]["docs_topic"]:
        return render_template(
            "details/empty-docs.html",
            package=package,
            channel_requested=channel_request,
        )

    docs_url_prefix = f"/{package['name']}/docs"

    docs = DocParser(
        api=discourse_api,
        index_topic_id=package["store_front"]["docs_topic"],
        url_prefix=docs_url_prefix,
    )
    docs.parse()
    body_html = docs.index_document["body_html"]

    topic_path = docs.index_document["topic_path"]

    if slug:
        topic_id = docs.resolve_path(slug)
        # topic = docs.api.get_topic(topic_id)
        # body_html = docs.parse_topic(topic)
        slug_docs = DocParser(
            api=discourse_api,
            index_topic_id=topic_id,
            url_prefix=docs_url_prefix,
        )
        slug_docs.parse()
        body_html = slug_docs.index_document["body_html"]
        topic_path = slug_docs.index_document["topic_path"]

    context = {
        "package": package,
        "navigation": docs.navigation,
        "body_html": body_html,
        "last_update": docs.index_document["updated"],
        "forum_url": docs.api.base_url,
        "topic_path": topic_path,
        "channel_requested": channel_request,
    }

    return render_template("details/docs.html", **context)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/configure')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_configuration(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(
        entity_name,
        channel_request,
        FIELDS.copy().extend(
            [
                "channel-map.revision.config-yaml",
                "default-release.revision.config-yaml",
            ]
        ),
    )

    return render_template(
        "details/configure.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/actions')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_actions(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(
        entity_name,
        channel_request,
        FIELDS.copy().extend(
            [
                "default-release.revision.actions-yaml",
                "channel-map.revision.actions-yaml",
            ]
        ),
    )

    return render_template(
        "details/actions.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/libraries')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_libraries(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    return render_template(
        "details/libraries/introduction.html",
        entity_name=entity_name,
        package=package,
        libraries=libraries,
        channel_requested=channel_request,
    )


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_library(entity_name, library_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    lib_parts = library_name.split(".")

    if len(lib_parts) > 2:
        group_name = ".".join(lib_parts[:-2])
        lib_name = "." + ".".join(lib_parts[-2:])
    else:
        group_name = "others"
        lib_name = library_name

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    library = next(
        (
            lib
            for lib in libraries.get(group_name, {})
            if lib.get("name") == lib_name
        ),
        None,
    )

    if not library:
        abort(404)

    library = publisher_api.get_charm_library(entity_name, library["id"])
    docstrings = logic.process_python_docs(library, module_name=library_name)

    return render_template(
        "details/libraries/library.html",
        entity_name=entity_name,
        package=package,
        libraries=libraries,
        library=library,
        docstrings=docstrings,
        channel_requested=channel_request,
    )


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>/download'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def download_library(entity_name, library_name):
    lib_parts = library_name.split(".")

    if len(lib_parts) > 2:
        group_name = ".".join(lib_parts[:-2])
        lib_name = "." + ".".join(lib_parts[-2:])
    else:
        group_name = "others"
        lib_name = library_name

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    library = next(
        (
            lib
            for lib in libraries.get(group_name, {})
            if lib.get("name") == lib_name
        ),
        None,
    )

    if not library:
        abort(404)

    library = publisher_api.get_charm_library(entity_name, library["id"])

    return Response(
        library["content"],
        mimetype="text/x-python",
        headers={
            "Content-disposition": "attachment; "
            f"filename={library['library-name']}.py"
        },
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/history')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_history(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    return render_template(
        "details/history.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/integrate')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_integrate(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    return render_template(
        "details/integrate.html",
        package=package,
        channel_requested=channel_request,
    )
