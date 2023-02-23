from flask import render_template, session

from canonicalwebteam.store_api.exceptions import (
    StoreApiError,
    StoreApiResourceNotFound,
    StoreApiResponseDecodeError,
    StoreApiResponseError,
    StoreApiResponseErrorList,
    StoreApiTimeoutError,
)

from canonicalwebteam import image_template

from webapp import authentication, helpers


def charmhub_utility_processor():
    """
    This defines the set of properties and functions that will be added
    to the default context for processing templates. All these items
    can be used in all templates
    """
    if authentication.is_authenticated(session):
        account = session["account"]
    else:
        account = None
    return {
        "add_filter": helpers.add_filter,
        "active_filter": helpers.active_filter,
        "remove_filter": helpers.remove_filter,
        "account": account,
        "image": image_template,
    }


def set_handlers(app):
    @app.context_processor
    def utility_processor():
        return charmhub_utility_processor()

    # Error handlers
    # ===
    @app.errorhandler(StoreApiTimeoutError)
    def handle_store_api_timeout(e):
        status_code = 504
        return (
            render_template(
                "500.html", error_message=str(e), status_code=status_code
            ),
            status_code,
        )

    @app.errorhandler(StoreApiResourceNotFound)
    def handle_store_api_circuit_breaker_exception(e):
        return render_template("404.html", message=str(e)), 404

    @app.errorhandler(StoreApiResponseErrorList)
    def handle_store_api_error_list(e):
        if e.status_code == 404:
            return render_template("404.html", message="Entity not found"), 404

        status_code = 502
        if e.errors:
            errors = ", ".join([e.get("message") for e in e.errors])
            return (
                render_template(
                    "500.html", error_message=errors, status_code=status_code
                ),
                status_code,
            )

        return (
            render_template("500.html", status_code=status_code),
            status_code,
        )

    @app.errorhandler(StoreApiResponseDecodeError)
    @app.errorhandler(StoreApiResponseError)
    @app.errorhandler(StoreApiError)
    def handle_store_api_error(e):
        status_code = 502
        return (
            render_template(
                "500.html", error_message=str(e), status_code=status_code
            ),
            status_code,
        )
