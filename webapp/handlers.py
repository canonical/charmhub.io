from flask import render_template, session

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
        render_template("500.html", error_message=str(e)), 504

    @app.errorhandler(StoreApiCircuitBreaker)
    def handle_store_api_circuit_breaker_exception(e):
        render_template("500.html", error_message=str(e)), 503

    @app.errorhandler(StoreApiResponseErrorList)
    def handle_store_api_error_list(e):
        if e.status_code == 404:
            return render_template("404.html", message="Entity not found"), 404

        if e.errors:
            errors = ", ".join(e.errors.key())
            return (
                render_template("500.html", error_message=errors),
                502,
            )

        return render_template("500.html"), 502

    @app.errorhandler(StoreApiResponseDecodeError)
    @app.errorhandler(StoreApiResponseError)
    @app.errorhandler(StoreApiError)
    def handle_store_api_error(e):
        return render_template("500.html", error_message=str(e)), 502
