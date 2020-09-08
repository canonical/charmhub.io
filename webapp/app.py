from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from flask import make_response, redirect, render_template, request, session

from webapp import authentication, config
from webapp.handlers import set_handlers
from webapp.login.views import login
from webapp.store.views import store
from webapp.docs.views import init_docs
from webapp.tutorials.views import init_tutorials
from webapp.publisher.views import publisher
from webapp.extensions import csrf


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
csrf.init_app(app)

app.register_blueprint(store)
app.register_blueprint(login)
app.register_blueprint(publisher)

init_docs(app, "/docs")
init_tutorials(app, "/tutorials")


@app.before_request
def before_request():
    if not authentication.is_canonical_employee_authenticated(
        session
    ) and not request.endpoint.startswith("login"):
        return redirect("/login?next=" + request.path)


@app.route("/")
def index():
    if authentication.is_canonical_employee_authenticated(session):
        response = make_response(render_template("index.html"))
    else:
        response = make_response(render_template("holding.html"))

    # Temporal fix to avoid cache since this page could return two versions
    response.headers.set("Cache-Control", "no-store")
    return response


@app.route("/about")
def about():
    return render_template("about/index.html")


@app.route("/about/manifesto")
def manifesto():
    return render_template("about/manifesto.html")


@app.route("/about/publishing")
def publishing():
    return render_template("about/publishing.html")


@app.route("/about/governance")
def governance():
    return render_template("about/governance.html")


@app.route("/about/glossary")
def glossary():
    return render_template("about/glossary.html")
