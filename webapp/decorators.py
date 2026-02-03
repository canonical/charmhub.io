# Core packages
import os
import functools
import logging
from datetime import datetime, timezone

# Third party packages
import flask
from webapp import authentication
from webapp.helpers import param_redirect_capture, param_redirect_exec

logger = logging.getLogger(__name__)


def strtobool(s: str) -> bool:
    """Convert a string representation of truth to true (1) or false (0)."""
    return s.lower() in ("yes", "true", "on", "1")


def cached_redirect(func):
    """
    Decorator that check for a param_redirect cookie and redirects
    to the appropriate URL.
    """

    @functools.wraps(func)
    def param_redirect(*args, **kwargs):
        resp = param_redirect_exec(
            req=flask.request,
            make_response=flask.make_response,
            redirect=flask.redirect,
        )
        if resp:
            return resp
        return func(*args, **kwargs)

    return param_redirect


def login_required(func):
    """
    Decorator that checks if a user is logged in, and redirects
    to login page if not.
    """

    @functools.wraps(func)
    def is_user_logged_in(*args, **kwargs):
        date = datetime.now(timezone.utc)
        date_str = date.strftime("%Y-%m-%dT%H:%M:%S")

        if not authentication.is_authenticated(flask.session):
            logger.warning(
                "User login failed",
                extra={
                    "datetime": date_str,
                    "appid": "charmhub-io",
                    "event": "authn_login_fail",
                },
            )

            response = flask.make_response(
                flask.redirect("/login?next=" + flask.request.path)
            )

            response = param_redirect_capture(flask.request, response)

            return response

        account = flask.session.get("account")
        user = account["email"]

        logger.info(
            f"User {user} login successfully",
            extra={
                "datetime": date_str,
                "appid": "charmhub-io",
                "event": f"authn_login_successafterfail:{user}",
            },
        )

        return func(*args, **kwargs)

    return is_user_logged_in


def store_maintenance(func):
    """
    Decorator that checks if the maintence mode is enabled
    """

    @functools.wraps(func)
    def is_store_in_maintenance(*args, **kwargs):
        # TODO: this will be a config option for the charm
        # or used from the app config using from_prefexed_env
        if strtobool(os.getenv("MAINTENANCE", "false")):
            return flask.render_template("maintenance.html")

        return func(*args, **kwargs)

    return is_store_in_maintenance


def redirect_uppercase_to_lowercase(func):
    """
    Decorator that redirect package names containing upper case
    to the lower case URL

    The route must have the entity_name parameter
    """

    @functools.wraps(func)
    def is_uppercase(*args, **kwargs):
        if "entity_name" in kwargs:
            name = kwargs["entity_name"]
        else:
            # For solutions - fallback to name if entity_name is not provided
            name = kwargs["name"]

        ENV = os.getenv("ENVIRONMENT", "devel").strip()
        redirect = flask.request.url.lower()

        if any(char.isupper() for char in name):
            if (
                (ENV == "devel" and redirect.startswith("http://localhost:"))
                or (
                    ENV == "production"
                    and redirect.startswith("https://charmhub.io/")
                )
                or (
                    ENV == "staging"
                    and redirect.startswith("https://staging.charmhub.io/")
                )
            ):
                return flask.redirect(redirect)
            else:
                flask.abort(404)

        return func(*args, **kwargs)

    return is_uppercase
