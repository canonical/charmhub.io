# Core packages
import os
import functools
from distutils.util import strtobool

# Third party packages
import flask
from webapp import authentication


def login_required(func):
    """
    Decorator that checks if a user is logged in, and redirects
    to login page if not.
    """

    @functools.wraps(func)
    def is_user_logged_in(*args, **kwargs):
        if not authentication.is_authenticated(flask.session):
            return flask.redirect("/login?next=" + flask.request.path)

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
