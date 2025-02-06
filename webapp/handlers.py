from flask import render_template, session
from webapp.config import SENTRY_DSN

from canonicalwebteam.exceptions import (
    StoreApiError,
    StoreApiResourceNotFound,
    StoreApiResponseDecodeError,
    StoreApiResponseError,
    StoreApiResponseErrorList,
    StoreApiTimeoutError,
    StoreApiConnectionError,
)

from canonicalwebteam import image_template

from webapp import authentication, helpers

CSP = {
    "default-src": ["'self'"],
    "img-src": [
        "'self'",
        "data: blob:",
        # This is needed to allow images from
        # https://www.google.*/ads/ga-audiences to load.
        "*",
    ],
    "script-src-elem": [
        "'self'",
        "assets.ubuntu.com",
        "www.googletagmanager.com",
        "*.crazyegg.com",
        "w.usabilla.com",
        # This is necessary for Google Tag Manager to function properly.
        "'unsafe-inline'",
    ],
    "font-src": [
        "'self'",
        "assets.ubuntu.com",
    ],
    "script-src": [
        "'self'",
        "blob:",
        "'unsafe-eval'",
        "'unsafe-hashes'",
    ],
    "connect-src": [
        "'self'",
        "sentry.is.canonical.com",
        "*.crazyegg.com",
        "analytics.google.com",
        "www.google-analytics.com",
        "stats.g.doubleclick.net",
    ],
    "frame-src": [
        "'self'",
        "td.doubleclick.net",
    ],
    "style-src": [
        "'self'",
        "'unsafe-inline'",
    ],
}


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
        "schedule_banner": helpers.schedule_banner,
        "account": account,
        "image": image_template,
        "SENTRY_DSN": SENTRY_DSN,
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
    @app.errorhandler(StoreApiConnectionError)
    @app.errorhandler(StoreApiError)
    def handle_store_api_error(e):
        status_code = 502
        return (
            render_template(
                "500.html", error_message=str(e), status_code=status_code
            ),
            status_code,
        )

    @app.after_request
    def add_headers(response):
        """
        Security headers to add to all requests
        - Content-Security-Policy: Restrict resources (e.g., JavaScript, CSS,
        Images) and URLs
        - Referrer-Policy: Limit referrer data for security while preserving
        full referrer for same-origin requests
        - Cross-Origin-Embedder-Policy: allows embedding cross-origin
        resources without credentials
        - Cross-Origin-Opener-Policy: enable the page to open pop-ups while
        maintaining same-origin policy
        - Cross-Origin-Resource-Policy: allowing cross-origin requests to
        access the resource
        - X-Permitted-Cross-Domain-Policies: disallows cross-domain access to
        resources
        """
        response.headers["Content-Security-Policy"] = helpers.get_csp_as_str(
            CSP
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
        response.headers[
            "Cross-Origin-Opener-Policy"
        ] = "same-origin-allow-popups"
        response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        return response
