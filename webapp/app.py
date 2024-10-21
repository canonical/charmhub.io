import re

import talisker.requests
from canonicalwebteam.store_api.stores.charmstore import (
    CharmStore,
    CharmPublisher,
)
from canonicalwebteam.candid import CandidClient
from dateutil import parser
from flask import render_template, make_response, request, session, escape
from webapp.extensions import csrf
from webapp.config import APP_NAME
from webapp.handlers import set_handlers
from webapp.login.views import login
from webapp.topics.views import topics
from webapp.publisher.views import publisher
from webapp.store.views import store
from webapp.integrations.views import integrations
from webapp.search.views import search
from webapp.search.logic import cache
from webapp.helpers import markdown_to_html
from webapp.decorators import login_required
from canonicalwebteam.flask_base.app import FlaskBase
from webapp.packages.store_packages import store_packages


app = FlaskBase(
    __name__,
    "charmhub.io",
    template_404="404.html",
    template_500="500.html",
    favicon_url="https://assets.ubuntu.com/v1/5d4edefd-jaas-favicon.png",
    static_folder="../static",
    template_folder="../templates",
)


app.name = APP_NAME
app.config["LOGIN_REQUIRED"] = login_required

set_handlers(app)

app.store_api = CharmStore(session=talisker.requests.get_session())


request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)

#### SETUP TELEMETRY

from webapp.observability.telemetry import setup_tracing, setup_metrics, instrument_app

instrument_app(app)

from opentelemetry.sdk.resources import Resource

resource = Resource.create({"service.name": APP_NAME})

setup_metrics(resource, app, "/metrics")


@app.template_filter("linkify")
def linkify(text):
    escaped_text = escape(text)
    url_pattern = re.compile(
        r"http[s]?://"
        r"(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|"
        r"(?:%[0-9a-fA-F][0-9a-fA-F]))+"
        r"(?:#[\w-]+)?"
    )

    def replace_with_link(match):
        url = match.group(0)
        anchor_tag = f'<a href="{url}" target="_blank">{url}</a>'
        return anchor_tag

    return url_pattern.sub(replace_with_link, str(escaped_text))


cache.init_app(app)
csrf.init_app(app)

app.register_blueprint(store_packages)
app.register_blueprint(publisher)
app.register_blueprint(store)
app.register_blueprint(login)
app.register_blueprint(topics)
app.register_blueprint(integrations)
app.register_blueprint(search)


app.jinja_env.filters["markdown"] = markdown_to_html


@app.route("/account.json")
def get_account_json():
    """
    A JSON endpoint to request login status
    """
    account = None

    if "account" in session:
        account = session["account"]

    response = {"account": account}
    response = make_response(response)
    response.headers["Cache-Control"] = "no-store"

    return response


@app.route("/contact-us")
def contact_us():
    return render_template("contact-us.html")


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
