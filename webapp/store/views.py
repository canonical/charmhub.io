from flask import Blueprint
from flask import current_app as app
from flask import render_template, request

from webapp.config import DETAILS_VIEW_REGEX
from webapp.store import logic
from webapp.store.content import data

store = Blueprint(
    "store",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)


@store.route("/store")
def store_view():
    query = request.args.get("q", default=None, type=str)
    sort = request.args.get("sort", default="", type=str)

    if query:
        results = app.store_api.find(query=query).get("results", [])
    else:
        results = app.store_api.find().get("results", [])

    for i, item in enumerate(results):
        results[i] = logic.add_store_front_data(results[i])

    context = {
        "categories": data.mock_categories,
        "publisher_list": data.mock_publisher_list,
        "sort": sort,
        "q": query,
        "results": results,
    }

    return render_template("store.html", **context)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
def details(entity_name):
    # Get entity info from API
    package = app.store_api.get_item_details(entity_name)
    package = logic.add_store_front_data(package)

    for channel in package["channel-map"]:
        channel["channel"]["released-at"] = logic.convert_date(
            channel["channel"]["released-at"]
        )

    # Put the information in a generic key for cleaner templates

    return render_template(
        "details.html", package=package, package_type=package["type"]
    )
