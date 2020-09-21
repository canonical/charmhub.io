from flask import Blueprint
from flask import current_app as app
from flask import render_template, request

from webapp.config import DETAILS_VIEW_REGEX
from webapp.store import logic

from mistune import (
    Renderer,
    Markdown,
)

store = Blueprint(
    "store",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)


renderer = Renderer()
parser = Markdown(
    renderer=renderer,
)


@store.route("/store")
def store_view():
    query = request.args.get("q", default=None, type=str)
    sort = request.args.get("sort", default="sort-asc", type=str)

    if query:
        results = app.store_api.find(query=query).get("results", [])
    else:
        results = app.store_api.find().get("results", [])

    for i, item in enumerate(results):
        results[i] = logic.add_store_front_data(results[i])

    categories = []
    publisher_list = []
    for result in results:
        for category in result["store_front"]["categories"]:
            if category not in categories:
                categories.append(category)
        if result["store_front"]["publisher_name"] not in publisher_list:
            publisher_list.append(result["store_front"]["publisher_name"])

    sorted_categories = sorted(categories, key=lambda k: k["slug"])
    sorted_publisher_list = sorted(publisher_list)

    context = {
        "categories": sorted_categories,
        "publisher_list": sorted_publisher_list,
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

    readme = parser(package["default-release"]["revision"]["readme-md"])

    return render_template(
        "details.html",
        package=package,
        readme=readme,
        package_type=package["type"],
    )
