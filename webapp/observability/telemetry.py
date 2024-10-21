import flask
from prometheus_client import generate_latest
from flask import Response
from opentelemetry.sdk.resources import Resource
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.metrics import MeterProvider


def instrument_app(app):
    FlaskInstrumentor().instrument_app(app)


def setup_tracing(resource: Resource, reciever_endpoint: str):
    trace_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(trace_provider)

    # Configure the OTLP exporter to send traces to Tempo
    otlp_exporter = OTLPSpanExporter(
        endpoint=reciever_endpoint, insecure=True
    )  # insecure=True for HTTP (gRPC)
    span_processor = BatchSpanProcessor(otlp_exporter)
    trace_provider.add_span_processor(span_processor)


def setup_metrics(resource: Resource, app: flask.Flask, metrics_endpoint: str):

    # Set up the MeterProvider and Prometheus metrics exporter
    metric_reader = PrometheusMetricReader()
    provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
    metrics.set_meter_provider(provider)

    @app.route(metrics_endpoint)
    def metrics_route():
        return Response(generate_latest(), mimetype="text/plain")
