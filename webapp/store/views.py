import re
from bs4 import BeautifulSoup
from canonicalwebteam.discourse import DocParser
from flask import Blueprint
from flask import current_app as app
from flask import make_response, render_template, request, session
from mistune import Markdown, Renderer

from webapp import authentication
from webapp.config import DETAILS_VIEW_REGEX
from webapp.helpers import discourse_api
from webapp.store import logic

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static"
)


renderer = Renderer()
parser = Markdown(
    renderer=renderer,
)


@store.route("/")
def index():
    if not authentication.is_canonical_employee_authenticated(session):
        response = make_response(render_template("holding.html"))
        response.headers.set("Cache-Control", "no-store")
        return response

    query = request.args.get("q", default=None, type=str)
    sort = request.args.get("sort", default="sort-asc", type=str)

    fields = [
        "categories",
        "summary",
        "media",
        "name",
        "publisher",
        "revision",
        "channel",
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
                {"name": "No Category", "slug": "no-cat"}
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

    context = {
        "categories": sorted_categories,
        "sort": sort,
        "q": query,
        "results": charms,
    }

    response = make_response(render_template("store.html", **context))
    response.headers.set("Cache-Control", "no-store")

    return response


FIELDS = [
    "media",
    "metadata-yaml",
    "config-yaml",
    "tags",
    "categories",
    "publisher",
    "summary",
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

    readme = parser(readme)
    soup = BeautifulSoup(readme, features="html.parser")

    # Change all the headers (value + 2, eg h1 => h3)
    for h in soup.find_all(re.compile("^h[1-6]$")):
        level = int(h.name[1:]) + 2
        if level > 6:
            level = 6
        h.name = f"h{str(level)}"

    return render_template(
        "details/overview.html",
        package=package,
        readme=soup,
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


@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/configuration'
)
def details_configuration(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/configuration.html", package=package)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/history')
def details_history(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)
    package = logic.add_store_front_data(package)

    return render_template("details/history.html", package=package)
