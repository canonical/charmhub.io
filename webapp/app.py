import talisker.requests
from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from flask import render_template

from webapp import config
from webapp.docs.views import init_docs
from webapp.extensions import csrf
from webapp.handlers import set_handlers
from webapp.login.views import login
from webapp.publisher.views import publisher
from webapp.store.views import store
from webapp.tutorials.views import init_tutorials

app = FlaskBase(
    __name__,
    config.APP_NAME,
    template_folder="../templates",
    static_folder="../static",
    template_404="404.html",
    template_500="500.html",
)
app.store_api = CharmStore(session=talisker.requests.get_session())

set_handlers(app)
csrf.init_app(app)

app.register_blueprint(store)
app.register_blueprint(login)
app.register_blueprint(publisher)

init_docs(app, "/docs")
init_tutorials(app, "/tutorials")


@app.route("/overview")
def overview():
    return render_template("overview.html")


@app.route("/topics/kubernetes")
def kubernetes():
    return render_template("topics/kubernetes.html")


@app.route("/about")
def about():
    return render_template("about/index.html")


@app.route("/manifesto")
def manifesto():
    return render_template("about/manifesto.html")


@app.route("/publishing")
def publishing():
    return render_template("about/publishing.html")


@app.route("/governance")
def governance():
    return render_template("about/governance.html")


@app.route("/glossary")
def glossary():
    return render_template("about/glossary.html")


@app.route("/contact-us")
def contact_us():
    return render_template("contact-us.html")


@app.route("/thank-you")
def thank_you():
    return render_template("thank-you.html")
