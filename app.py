# This file serves as an entry point for the rock image. It is required by the PaaS app charmer.
# The flask application must be defined in this file under the variable name `app`.
# See - https://documentation.ubuntu.com/rockcraft/en/latest/reference/extensions/flask-framework/
import os
import logging
from flask import request, g, Flask
from werkzeug.exceptions import HTTPException
import time

from webapp.observability.metrics import RequestsMetrics

# canonicalwebteam.flask-base requires SECRET_KEY to be set, this must be done before importing the app
os.environ["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]

# disable talisker logger, as it is not used in this application and clutters logs
logging.getLogger("talisker.context").disabled = True

from webapp.app import app

def register_metrics(app: Flask):

    @app.before_request
    def start_timer():
        g.start_time = time.time()


    @app.after_request
    def record_metrics(response):
        duration_ms = (time.time() - g.get('start_time', time.time())) * 1000

        labels = {
            'view': request.endpoint or 'unknown',
            'method': request.method,
            'status': str(response.status_code),
        }

        RequestsMetrics.requests.inc(1,**labels)
        RequestsMetrics.latency.observe(duration_ms, **labels)

        return response

    @app.teardown_request
    def handle_teardown(exception):
        if exception:
            # log 5xx errors
            status_code = getattr(exception, 'code', 500)

            labels = {
                'view': request.endpoint or 'unknown',
                'method': request.method,
                'status': str(status_code),
            }

            if status_code >= 500:
                RequestsMetrics.errors.inc(1,**labels)


register_metrics(app)
