from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from flask import render_template

from webapp import helpers, config
from webapp.store.views import store
from webapp.error_handling import register_error_handlers

app = FlaskBase(
    __name__,
    config.APP_NAME,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)
app.store_api = CharmStore()

register_error_handlers(app)
app.register_blueprint(store)


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
