# This file serves as an entry point for the rock image. It is required by the PaaS app charmer.
# The flask application must be defined in this file under the variable name `app`.
# See - https://documentation.ubuntu.com/rockcraft/en/latest/reference/extensions/flask-framework/
import os
import logging
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.trace import Span

# canonicalwebteam.flask-base requires SECRET_KEY to be set, this must be done before importing the app
os.environ["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]

# disable talisker logger, as it is not used in this application and clutters logs
logging.getLogger("talisker.context").disabled = True

from webapp.app import app

UNTRACED_ROUTES = [
    "/_status",
    ".*[.jpg|.jpeg|.png|.gif|.ico|.css|.js|.json]$",
]


def request_hook(span: Span, environ):
    if span and span.is_recording():
        span.update_name(f"{environ['REQUEST_METHOD']} {environ['PATH_INFO']}")


# Add tracing auto instrumentation
FlaskInstrumentor().instrument_app(
    app, excluded_urls=",".join(UNTRACED_ROUTES), request_hook=request_hook
)
RequestsInstrumentor().instrument()
