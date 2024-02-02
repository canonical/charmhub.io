# Core packages
import os
import functools
from distutils.util import strtobool

# Third party packages
import flask
from webapp import authentication
from webapp.helpers import param_redirect_capture, param_redirect_exec


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
        if not authentication.is_authenticated(flask.session):
            response = None
            if "beta" in flask.request.url:
                response = flask.make_response(
                    flask.redirect("/login?next=/beta" + flask.request.path)
                )
            response = flask.make_response(
                flask.redirect("/login?next=" + flask.request.path)
            )

            response = param_redirect_capture(flask.request, response)

            return response

        return func(*args, **kwargs)

    return is_user_logged_in


def store_maintenance(func):
    """
    Decorator that checks if the maintence mode is enabled
    """

    @functools.wraps(func)
    def is_store_in_maintenance(*args, **kwargs):
        if strtobool(os.getenv("MAINTENANCE")):
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
        name = kwargs["entity_name"]

        if any(char.isupper() for char in name):
            return flask.redirect(flask.request.url.lower())

        return func(*args, **kwargs)

    return is_uppercase
