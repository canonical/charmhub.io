import re
from canonicalwebteam.discourse import DocParser
from flask import Blueprint
from flask import current_app as app
from flask import render_template, request

from webapp.config import DETAILS_VIEW_REGEX
from webapp.helpers import discourse_api, md_parser, increase_headers
from webapp.store import logic
from webapp.store.mock import get_charm_libraries

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static"
)


@store.route("/")
def index():
    query = request.args.get("q", default=None, type=str)
    sort = request.args.get("sort", default="sort-asc", type=str)

    fields = [
        "result.categories",
        "result.summary",
        "result.media",
        "result.publisher.display-name",
        "default-release.revision.revision",
        "default-release.channel",
    ]

    if query:
        results = app.store_api.find(query=query, fields=fields).get("results")
    else:
        results = app.store_api.find(fields=fields).get("results", [])

    charms = []
    categories = []
    for i, item in enumerate(results):
        results[i]["store_front"] = {}
        results[i]["store_front"]["icons"] = logic.get_icons(results[i])
        results[i]["store_front"]["last_release"] = logic.convert_date(
            results[i]["default-release"]["channel"]["released-at"]
        )

        if results[i]["result"]["categories"]:
            results[i]["store_front"]["categories"] = logic.get_categories(
                results[i]["result"]["categories"]
            )
        else:
            results[i]["store_front"]["categories"] = [
                {"name": "Other", "slug": "other"}
            ]

        if (
            results[i]["type"] == "charm"
            and results[i]["result"]["publisher"]["display-name"]
        ):
            for category in results[i]["store_front"]["categories"]:
                if category not in categories:
                    categories.append(category)

            charms.append(results[i])

    sorted_categories = sorted(categories, key=lambda k: k["name"])

    sort_order = True if sort == "name-desc" else False
    charms = sorted(charms, key=lambda c: c["name"], reverse=sort_order)

    context = {
        "categories": sorted_categories,
        "sort": sort,
        "q": query,
        "results": charms,
    }

    return render_template("store.html", **context)


FIELDS = [
    "result.media",
    "default-release",
    "result.categories",
    "result.publisher.display-name",
    "result.summary",
    "channel-map",
]


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
def details_overview(entity_name):
    # Get entity info from API
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    for channel in package["channel-map"]:
        channel["channel"]["released-at"] = logic.convert_date(
            channel["channel"]["released-at"]
        )

    readme = package["default-release"]["revision"]["readme-md"]

    # Remove Markdown comments
    readme = re.sub("(<!--.*-->)", "", readme, flags=re.DOTALL)

    readme = md_parser(readme)
    readme = increase_headers(readme)

    return render_template(
        "details/overview.html",
        package=package,
        readme=readme,
        package_type=package["type"],
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs')
@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs/<slug>')
def details_docs(entity_name, slug=None):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)
    docs_url_prefix = f"/{package['name']}/docs"

    # Fake package discourse topic
    package["docs_topic"] = 3568

    docs = DocParser(
        api=discourse_api,
        index_topic_id=package["docs_topic"],
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
    }

    return render_template("details/docs.html", **context)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/configure')
def details_configuration(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/configure.html", package=package)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/actions')
def details_actions(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/actions.html", package=package)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/libraries')
def details_libraries(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    libraries = get_charm_libraries()

    return render_template(
        "details/libraries/introduction.html",
        entity_name=entity_name,
        package=package,
        libraries=libraries,
    )


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>'
)
def details_library(entity_name, library_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    lib_parts = library_name.split(".")
    lib_group = ".".join(lib_parts[:-2])
    lib_name = "." + ".".join(lib_parts[-2:])

    libraries = get_charm_libraries()
    library = next(
        (lib for lib in libraries[lib_group] if lib["name"] == lib_name),
        None,
    )

    docstrings = logic.process_python_docs(library, module_name=library_name)

    return render_template(
        "details/libraries/library.html",
        entity_name=entity_name,
        package=package,
        libraries=libraries,
        library=library,
        docstrings=docstrings,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/history')
def details_history(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/history.html", package=package)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/integrate')
def details_integrate(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/integrate.html", package=package)
