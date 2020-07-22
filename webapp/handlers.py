from flask import abort, session
from canonicalwebteam.store_api.exceptions import (
    StoreApiCircuitBreaker,
    StoreApiError,
    StoreApiResponseDecodeError,
    StoreApiResponseError,
    StoreApiResponseErrorList,
    StoreApiTimeoutError,
)

from webapp import authentication, helpers


def set_handlers(app):
    @app.context_processor
    def utility_processor():
        """
        This defines the set of properties and functions that will be added
        to the default context for processing templates. All these items
        can be used in all templates
        """

        if authentication.is_authenticated(session):
            publisher = session["publisher"]
        else:
            publisher = None

        return {
            "add_filter": helpers.add_filter,
            "active_filter": helpers.active_filter,
            "remove_filter": helpers.remove_filter,
            "publisher": publisher,
        }

    # Error handlers
    # ===
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
