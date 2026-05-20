import os
from urllib.parse import urlparse

import flask
from flask_openid import OpenID
from pymacaroons import Macaroon

from webapp import authentication
from webapp.extensions import csrf
from webapp.helpers import is_safe_url
from webapp.login.macaroon import MacaroonRequest, MacaroonResponse
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway

login = flask.Blueprint(
    "login", __name__, template_folder="/templates", static_folder="/static"
)

PUBLISHER_API_URL = os.getenv("PUBLISHERGW_URL", "https://api.charmhub.io")

LOGIN_URL = os.getenv("FLASK_LOGIN_URL", "https://login.ubuntu.com")
LOGIN_USSO_TTL = int(os.getenv("FLASK_LOGIN_USSO_TTL", "300"))

open_id = OpenID(
    store_factory=lambda: None,
    safe_roots=[],
    extension_responses=[MacaroonResponse],
)


def get_caveat_id(root: str):
    location = urlparse(LOGIN_URL).hostname
    caveat = next(
        (
            c
            for c in Macaroon.deserialize(root).third_party_caveats()
            if c.location == location
        ),
        None,
    )
    if caveat is None:
        caveat = next(
            (
                c
                for c in Macaroon.deserialize(root).third_party_caveats()
                if urlparse(f"https://{c.location}").hostname == location
            ),
            None,
        )
    if caveat is None:
        raise ValueError("No third-party caveat found on root macaroon")
    return caveat.caveat_id


@trace_function
@login.route("/logout")
def logout():
    authentication.empty_session(flask.session)
    return flask.redirect("/")


@trace_function
@login.route("/login", methods=["GET", "POST"])
@csrf.exempt
@open_id.loginhandler
def publisher_login():
    if authentication.is_authenticated(flask.session):
        return flask.redirect("/")

    flask.session["account-macaroon"] = publisher_gateway.issue_usso_macaroon(
        ttl=LOGIN_USSO_TTL,
        permissions=[
            "account-register-package",
            "account-view-packages",
            "package-manage",
            "package-view",
        ],
    )

    openid_macaroon = MacaroonRequest(
        caveat_id=get_caveat_id(flask.session["account-macaroon"])
    )

    next_url = flask.request.args.get("next")
    if next_url:
        if not is_safe_url(next_url):
            return flask.abort(400)
        flask.session["next_url"] = next_url

    return open_id.try_login(
        LOGIN_URL,
        ask_for=["email", "nickname", "image"],
        ask_for_optional=["fullname"],
        extensions=[openid_macaroon],
    )


@open_id.after_login
def login_callback(resp):
    discharge = resp.extensions.get("macaroon")
    discharge_macaroon = getattr(discharge, "discharge", None)
    if not discharge_macaroon:
        return flask.abort(
            502, "Ubuntu SSO login did not return macaroon discharge"
        )

    root_macaroon = flask.session["account-macaroon"]
    bound_discharge = Macaroon.deserialize(root_macaroon).prepare_for_request(
        Macaroon.deserialize(discharge_macaroon)
    )

    user_agent = flask.request.headers.get("User-Agent")
    client_description = f"charmhub.io - {user_agent}" if user_agent else None

    flask.session["account-auth"] = publisher_gateway.exchange_usso_macaroons(
        root_macaroon=root_macaroon,
        discharge_macaroon=bound_discharge.serialize(),
        client_description=client_description,
    )

    flask.session.update(
        publisher_gateway.macaroon_info(flask.session["account-auth"])
    )

    return flask.redirect(flask.session.pop("next_url", "/charms"), 302)
