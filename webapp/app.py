from pprint import pprint
import talisker.requests
# from canonicalwebteam.flask_base.app import FlaskBase
from canonicalwebteam.store_api.stores.charmstore import CharmStore
from canonicalwebteam.store_base.app import create_app
from dateutil import parser
from flask import render_template, make_response, request, session, Blueprint, url_for

from webapp import config
# from webapp.extensions import csrf
from webapp.handlers import set_handlers
from webapp.login.views import login
from webapp.topics.views import topics
from webapp.publisher.views import publisher
from webapp.store.views import store
from webapp.interfaces.views import interfaces

charmhub_bp = Blueprint(
    "charmhub_bp",
    __name__,
    template_folder="../templates",
    static_folder="../static",
    static_url_path="", 
)

app = create_app(
    "charmhub",
    store_bp=charmhub_bp
)
app.name = "charmhub.io"
app.static_url_path=""
# app.static_folder="static"
app.static_folder=charmhub_bp.static_folder
app.template_folder=charmhub_bp.template_folder
app.static_url_path=charmhub_bp.static_url_path
pprint({"app.static_folder": app.static_folder})
pprint({"app.static_folder": app.template_folder})

app.store_api = CharmStore(talisker.requests.get_session())

set_handlers(app)
  
app.register_blueprint(publisher)
app.register_blueprint(store)
app.register_blueprint(topics)
app.register_blueprint(interfaces)


@app.route("/overview")
def overview():
    return render_template("/details/overview.html")


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


@app.route("/get-in-touch")
def get_in_touch():
    return render_template("partial/_get-in-touch.html")


@app.route("/thank-you")
def thank_you():
    return render_template("thank-you.html")


@app.route("/icon-validator")
def icon_validator():
    return render_template("icon-validator.html")


@app.route("/sitemap.xml")
def site_map():
    xml_sitemap = render_template(
        "sitemap/sitemap.xml",
        base_url=f"{request.scheme}://{request.host}",
    )
    response = make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"

    return response


@app.route("/sitemap-links.xml")
def site_map_links():
    links = [
        "/overview",
        "/about",
        "/manifesto",
        "/publishing",
        "/governance",
        "/glossary",
        "/contact-us",
    ]

    xml_sitemap = render_template(
        "sitemap/sitemap-links.xml",
        base_url=f"{request.scheme}://{request.host}",
        links=links,
    )
    response = make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"

    return response


@app.route("/sitemap-operators.xml")
def site_map_operators():
    charms = app.store_api.find(
        fields=["default-release.channel.released-at"]
    ).get("results", [])

    for charm in charms:
        charm["date"] = (
            parser.parse(charm["default-release"]["channel"]["released-at"])
            .replace(tzinfo=None)
            .strftime("%Y-%m-%d")
        )

    xml_sitemap = render_template(
        "sitemap/sitemap-operators.xml",
        base_url=f"{request.scheme}://{request.host}",
        charms=charms,
    )
    response = make_response(xml_sitemap)
    response.headers["Content-Type"] = "application/xml"

    return response
