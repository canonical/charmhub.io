from canonicalwebteam.flask_base.app import FlaskBase
from flask import render_template

from webapp import helpers

# Rename your project below
app = FlaskBase(
    __name__,
    "charmhub.io",
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


@app.route("/details")
def details():
    return render_template("details.html")
