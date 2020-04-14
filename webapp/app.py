from canonicalwebteam.flask_base.app import FlaskBase
from flask import render_template, request

from webapp import helpers
from webapp.charmhub import (
    config,
    mock_entities,
    mock_search_results,
    mock_categories,
    mock_publisher_list,
)

app = FlaskBase(
    __name__,
    config.app_name,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)


@app.context_processor
def utility_processor():
    return {
        "add_filter": helpers.add_filter,
        "active_filter": helpers.active_filter,
        "get_filter_count": helpers.get_filter_count,
        "remove_filter": helpers.remove_filter,
    }


@app.route("/")
def index():
    context = {
        "categories": mock_categories,
        "publisher_list": mock_publisher_list,
        "results": mock_search_results,
    }
    return render_template("index.html", **context)


@app.route('/<regex("' + config.details_regex + '"):entity_name>')
def details(entity_name):
    # TO DO - get entity info from API

    # TO DO this will not be required when we have the data from the API
    entity_type = request.args.get("type")
    if entity_type == "bundle":
        context = mock_entities[0]
    else:
        context = mock_entities[1]

    return render_template("details.html", **context)
