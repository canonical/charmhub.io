from flask import render_template, make_response, request, session
from dateutil import parser

from canonicalwebteam.candid import CandidClient
from canonicalwebteam.flask_base.app import FlaskBase

from webapp.store_api import publisher_gateway
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
from webapp.packages.store_packages import store_packages
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.trace import Span,get_current_span
import requests


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

request_session = requests.Session()
candid = CandidClient(request_session)
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

# OpenTelemetry
UNTRACED_ROUTES = ["/_status", "/static", ".json"]


def request_hook(span: Span, environ):
    if span and span.is_recording():
        span.update_name(f"{environ['REQUEST_METHOD']} {environ['PATH_INFO']}")


# Add tracing auto instrumentation
FlaskInstrumentor().instrument_app(
    app, excluded_urls=",".join(UNTRACED_ROUTES), request_hook=request_hook
)
RequestsInstrumentor().instrument()


@app.after_request
def add_trace_id_header(response):
    span = get_current_span()
    ctx = span.get_span_context()
    if ctx and ctx.trace_id != 0:
        # trace_id is an int → format as 32-char hex (standard W3C format)
        trace_id_hex = format(ctx.trace_id, "032x")
        response.headers["X-Request-ID"] = trace_id_hex
    return response


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
    charms = publisher_gateway.find(
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
