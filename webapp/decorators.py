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
