from canonicalwebteam.flask_base.app import FlaskBase
from flask import render_template, request

from webapp import helpers
from webapp.charmhub import config

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
        "remove_filter": helpers.remove_filter,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route('/<regex("' + config.details_regex + '"):entity_name>')
def details(entity_name):
    # TODO this will not be required when we have the type from the API
    entity_type = request.args.get("type", "charm")

    context = {
        "entity_type": entity_type,
    }
    return render_template("details.html", **context)
