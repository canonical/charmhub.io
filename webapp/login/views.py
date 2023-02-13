from pprint import pprint
import talisker
import flask

from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from flask_wtf.csrf import generate_csrf, validate_csrf

from canonicalwebteam.candid import CandidClient
from webapp.helpers import is_safe_url
from canonicalwebteam.store_base.auth.login.views import login, candid_login, all_login_callback

request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)

@login.route("/login")
def publisher_login():
    user_agent = flask.request.headers.get("User-Agent")

#     # Get a bakery v2 macaroon from the publisher API to be discharged
#     # and save it in the session
    macaroon_response = publisher_api.issue_macaroon(
        [
            "account-register-package",
            "account-view-packages",
            "package-manage",
            "package-view",
        ],
        description=f"charmhub.io - {user_agent}",
    )
    callback_url = flask.url_for("login.login_callback", _external=True)
    return candid_login(macaroon_response, callback_url, "/charms")


@login.route("/login/callback")
def login_callback():
    pprint(flask.session)
    return all_login_callback(
        publisher_api,
        publisher_api.exchange_macaroons,
        "/charms"
    )
