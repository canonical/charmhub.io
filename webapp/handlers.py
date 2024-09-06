from flask import render_template, session
from webapp.config import SENTRY_DSN

import base64
import hashlib
import re

from canonicalwebteam.store_api.exceptions import (
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
        "assets.ubuntu.com",
        "res.cloudinary.com",
        "api.charmhub.io",
        "charmhub.io",
        "*.cdn.snapcraftcontent.com",
        "www.googletagmanager.com",
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
    "script-src": [],
    "connect-src": [
        "'self'",
        "sentry.is.canonical.com",
        "*.crazyegg.com",
    ],
    "frame-src": [
        "'self'",
    ],
    "style-src": [
        "'self'",
        "'unsafe-inline'",
    ],
}

CSP_SCRIPT_SRC = [
    "'self'",
    "blob:",
    "'unsafe-eval'",
    "'unsafe-hashes'",
]

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
    
    # Calculate the SHA256 hash of the script content and encode it in base64.
    def calculate_sha256_base64(script_content):
        sha256_hash = hashlib.sha256(script_content.encode()).digest()
        return "sha256-" + base64.b64encode(sha256_hash).decode()

    def get_csp_directive(content, regex):
        directive_items = set()
        pattern = re.compile(regex)
        matched_contents = pattern.findall(content)
        for matched_content in matched_contents:
            hash_value = f"'{calculate_sha256_base64(matched_content)}'"
            directive_items.add(hash_value)
        return list(directive_items)

    # Find all script elements in the response and add their hashes to the CSP.
    def add_script_hashes_to_csp(response):
        response.freeze()
        decoded_content = b"".join(response.response).decode(
            "utf-8", errors="replace"
        )

        CSP["script-src"] = CSP_SCRIPT_SRC 
        # + get_csp_directive(
        #     decoded_content, r'onclick\s*=\s*"(.*?)"'
        # )
        return CSP
    
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
        - Cross-Origin-Resource-Policy: allowing only same-origin requests to
        access the resource
        - X-Permitted-Cross-Domain-Policies: disallows cross-domain access to
        resources
        """
         
        csp = add_script_hashes_to_csp(response)
        response.headers["Content-Security-Policy"] = helpers.get_csp_as_str(
            csp
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
        response.headers["Cross-Origin-Opener-Policy"] = (
            "same-origin-allow-popups"
        )
        response.headers["Cross-Origin-Resource-Policy"] = "same-site"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        return response
