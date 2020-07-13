from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from flask import make_response, render_template, session

from webapp import authentication, config
from webapp.decorators import login_required
from webapp.handlers import set_handlers
from webapp.login.views import login
from webapp.store.views import store
from webapp.docs.views import init_docs
from webapp.tutorials.views import init_tutorials
from webapp.publisher.views import publisher

app = FlaskBase(
    __name__,
    config.APP_NAME,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)
app.store_api = CharmStore()

set_handlers(app)
app.register_blueprint(store)
app.register_blueprint(publisher)
app.register_blueprint(login)

init_docs(app, "/docs")
init_tutorials(app, "/tutorials")


@app.route("/")
def index():
    if authentication.is_authenticated(session):
        response = make_response(render_template("index.html"))
    else:
        response = make_response(render_template("holding.html"))

    # Temporal fix to avoid cache since this page could return two versions
    response.headers.set("Cache-Control", "no-store")
    return response


@app.route("/about")
@login_required
def about():
    return render_template("about/index.html")


@app.route("/about/manifesto")
@login_required
def manifesto():
    return render_template("about/manifesto.html")


@app.route("/about/publishing")
@login_required
def publishing():
    return render_template("about/publishing.html")


@app.route("/about/governance")
@login_required
def governance():
    return render_template("about/governance.html")


@app.route("/about/glossary")
@login_required
def glossary():
    return render_template("about/glossary.html")
