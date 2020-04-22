from flask import Blueprint
from flask import current_app as app
from flask import render_template, request

from webapp.config import DETAILS_VIEW_REGEX
from webapp.store import logic
from webapp.store.content import data

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static",
)


@store.route("/store")
def store_view():
    api_search_results = app.store_api.find().get("results")

    for i, item in enumerate(api_search_results):
        api_search_results[i] = data.mock_missing_properties(
            api_search_results[i]
        )

    results = api_search_results + data.gen_mock_data()

    for i, item in enumerate(results):
        results[i] = logic.add_store_front_data(results[i])

    context = {
        "categories": data.mock_categories,
        "publisher_list": data.mock_publisher_list,
        "results": results,
    }

    return render_template("store.html", **context)


@store.route("/search")
def search():
    query = request.args.get("q", default="", type=str)

    return render_template("store.html", results=app.store_api.find(q=query))


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
def details(entity_name):
    # Get entity info from API
    package = data.mock_missing_properties(
        app.store_api.get_item_details(entity_name)
    )

    package = logic.add_store_front_data(package)

    return render_template(
        "details.html", package=package, package_type=package["package-type"]
    )
