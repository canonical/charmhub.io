from flask import abort
from canonicalwebteam.store_api.exceptions import (
    StoreApiCircuitBreaker,
    StoreApiError,
    StoreApiResponseDecodeError,
    StoreApiResponseError,
    StoreApiResponseErrorList,
    StoreApiTimeoutError,
)


def register_error_handlers(app):
    @app.errorhandler(StoreApiTimeoutError)
    def handle_store_api_timeout(e):
        abort(504, str(e))

    @app.errorhandler(StoreApiCircuitBreaker)
    def handle_store_api_circuit_breaker_exception(e):
        abort(503, str(e))

    @app.errorhandler(StoreApiResponseErrorList)
    def handle_store_api_error_list(e):
        if e.status_code == 404:
            abort(404, "Entity not found")

        if e.errors:
            abort(502, ", ".join(e.errors.key()))

        abort(502, "An error occurred.")

    @app.errorhandler(StoreApiResponseDecodeError)
    @app.errorhandler(StoreApiResponseError)
    @app.errorhandler(StoreApiError)
    def handle_store_api_error(e):
        abort(502, str(e))
