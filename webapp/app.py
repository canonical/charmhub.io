import talisker.requests
from flask import (
    render_template,
    make_response,
    request,
    session,
    g,
    has_request_context,
)
import logging
import uuid
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
from opentelemetry.instrumentation.wsgi import OpenTelemetryMiddleware
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.trace import Span
from opentelemetry import trace
import logging


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

request_session = talisker.requests.get_session()
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

app.wsgi_app = OpenTelemetryMiddleware(app.wsgi_app)

import logging


class LogfmtFormatter(logging.Formatter):
    def format(self, record):
        # gunicorn.access log records have some custom attributes:
        # record.message, record.args typically include client address, request line, status, etc.
        # We parse the record's `msg` assuming the default gunicorn format
        raw_msg = record.getMessage()
        # crude parsing (you may want to parse more robustly)
        parts = raw_msg.split('"')
        if len(parts) >= 3:
            request_line = parts[1]
            pre = parts[0].strip()
            post = parts[2].strip()
            client_ip = pre.split()[0]
            status_code = post.split()[0] if post else ""
        else:
            request_line = raw_msg
            client_ip = "-"
            status_code = "-"

        logfmt = (
            f'time="{self.formatTime(record)}" '
            f"level={record.levelname.lower()} "
            f"client_ip={client_ip} "
            f"status={status_code} "
            f'request="{request_line}"'
        )
        return logfmt


import logging

# Apply the formatter to gunicorn.access logger
access_logger = logging.getLogger("werkzeug")
for handler in access_logger.handlers:
    handler.setFormatter(LogfmtFormatter())


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
    charms = publisher_gateway.find(fields=["default-release.channel.released-at"]).get(
        "results", []
    )

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
