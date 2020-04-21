from flask import Blueprint, render_template, request
from flask import current_app as app

from webapp.config import DETAILS_VIEW_REGEX
from webapp.store.content import data

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static",
)


@store.route("/store")
def store_view():
    api_search_results = app.store_api.find()

    context = {
        "categories": data.mock_categories,
        "publisher_list": data.mock_publisher_list,
        "results": api_search_results.get("results", []),
    }

    return render_template("store.html", **context)


@store.route("/search")
def search():
    query = request.args.get("q", default="", type=str)

    return render_template("store.html", results=app.store_api.find(q=query))


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
def details(entity_name):
    # Get entity info from API
    try:
        entity = app.store_api.get_item_details(entity_name)
    except Exception:
        pass

    if entity:
        return render_template("details.html", **entity)

    # TO DO this will not be required when we have the data from the API
    entity_type = request.args.get("type")
    if entity_type == "bundle":
        context = data.mock_entities[0]
    else:
        context = data.mock_entities[1]

    return render_template("details.html", **context)
