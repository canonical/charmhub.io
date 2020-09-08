import os
import talisker
import flask

from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from flask_openid import OpenID
from django_openid_auth.teams import TeamsRequest, TeamsResponse
from flask_wtf.csrf import generate_csrf, validate_csrf

from webapp.login.candid import CandidClient
from webapp.helpers import is_safe_url
from webapp import authentication

login = flask.Blueprint(
    "login", __name__, template_folder="/templates", static_folder="/static"
)

LOGIN_URL = os.getenv("LOGIN_URL", "https://login.ubuntu.com")
LOGIN_LAUNCHPAD_TEAM = os.getenv(
    "LOGIN_LAUNCHPAD_TEAM", "canonical-webmonkeys"
)

open_id = OpenID(
    stateless=True, safe_roots=[], extension_responses=[TeamsResponse],
)
request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)


@login.route("/login", methods=["GET", "POST"])
@open_id.loginhandler
def login_handler():
    if authentication.is_canonical_employee_authenticated(flask.session):
        return flask.redirect(open_id.get_next_url())

    lp_teams = TeamsRequest(query_membership=[LOGIN_LAUNCHPAD_TEAM])

    return open_id.try_login(
        LOGIN_URL, ask_for=["email"], extensions=[lp_teams],
    )


@open_id.after_login
def after_login(resp):
    if LOGIN_LAUNCHPAD_TEAM not in resp.extensions["lp"].is_member:
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


@login.route("/publisher/login/")
def publisher_login():
    # Get a bakery v2 macaroon from the publisher API to be discharged
    # and save it in the session
    flask.session["publisher-macaroon"] = publisher_api.get_macaroon()

    login_url = candid.get_login_url(
        macaroon=flask.session["publisher-macaroon"],
        callback_url=flask.url_for("login.login_callback", _external=True),
        state=generate_csrf(),
    )

    # Next URL to redirect the user after the login
    next_url = flask.request.args.get("next")

    if next_url:
        if not is_safe_url(next_url):
            return flask.abort(400)
        flask.session["next_url"] = next_url

    return flask.redirect(login_url, 302)


@login.route("/login/callback")
def login_callback():
    code = flask.request.args["code"]
    state = flask.request.args["state"]

    # Avoid CSRF attacks
    validate_csrf(state)

    discharged_token = candid.discharge_token(code)
    candid_macaroon = candid.discharge_macaroon(
        flask.session["publisher-macaroon"], discharged_token
    )

    # Store bakery authentication
    flask.session["publisher-auth"] = candid.get_serialized_bakery_macaroon(
        flask.session["publisher-macaroon"], candid_macaroon
    )

    flask.session["publisher"] = publisher_api.whoami(
        flask.session["publisher-auth"]
    )

    return flask.redirect(
        flask.session.pop("next_url", flask.url_for("publisher.charms"),), 302,
    )
