from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from flask import jsonify, render_template, request

from webapp import helpers
from webapp.charmhub import (
    config,
    mock_categories,
    mock_entities,
    mock_publisher_list,
    mock_search_results,
)

app = FlaskBase(
    __name__,
    config.app_name,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)
store = CharmStore()


@app.context_processor
def utility_processor():
    return {
        "add_filter": helpers.add_filter,
        "active_filter": helpers.active_filter,
        "remove_filter": helpers.remove_filter,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/store")
def store():
    api_search_results = store.find()
    print(api_search_results)

    context = {
        "categories": mock_categories,
        "publisher_list": mock_publisher_list,
        "results": mock_search_results,
    }
    return render_template("store.html", **context)


@app.route('/<regex("' + config.details_regex + '"):entity_name>')
def details(entity_name):
    # Get entity info from API
    try:
        entity = store.get_item_details(entity_name)
        return jsonify(entity)
    except Exception:
        pass

    # TO DO this will not be required when we have the data from the API
    entity_type = request.args.get("type")
    if entity_type == "bundle":
        context = mock_entities[0]
    else:
        context = mock_entities[1]

    return render_template("details.html", **context)
