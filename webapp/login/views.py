import os

import flask
from django_openid_auth.teams import TeamsRequest, TeamsResponse
from flask_openid import OpenID

from webapp import authentication

login = flask.Blueprint(
    "login", __name__, template_folder="/templates", static_folder="/static"
)

LOGIN_URL = os.getenv("LOGIN_URL", "https://login.ubuntu.com")
LP_CANONICAL_TEAM = os.getenv("LOGIN_GROUP", "canonical-webmonkeys")

open_id = OpenID(
    stateless=True, safe_roots=[], extension_responses=[TeamsResponse],
)


@login.route("/login", methods=["GET", "POST"])
@open_id.loginhandler
def login_handler():
    if authentication.is_authenticated(flask.session):
        return flask.redirect(open_id.get_next_url())

    lp_teams = TeamsRequest(query_membership=[LP_CANONICAL_TEAM])

    return open_id.try_login(
        LOGIN_URL, ask_for=["email"], extensions=[lp_teams],
    )


@open_id.after_login
def after_login(resp):
    if LP_CANONICAL_TEAM not in resp.extensions["lp"].is_member:
        flask.abort(403)

    flask.session["openid"] = {
        "identity_url": resp.identity_url,
        "email": resp.email,
    }

    return flask.redirect(open_id.get_next_url())


@login.route("/logout")
def logout():
    authentication.empty_session(flask.session)
    return flask.redirect("/")
