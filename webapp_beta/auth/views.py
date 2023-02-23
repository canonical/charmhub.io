from pprint import pprint
import talisker
import flask

from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from canonicalwebteam.store_base.auth.login.views import logout, candid_login, candid_login_callback

from canonicalwebteam.candid import CandidClient

from webapp_beta.publisher.views import publisher

request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)

auth = flask.Blueprint(
    "auth", __name__, template_folder="/templates", static_folder="/static"
)


@auth.route("/login")
def login():
    user_agent = flask.request.headers.get("User-Agent")

    macaroon_response = publisher_api.issue_macaroon(
        [
            "account-register-package",
            "account-view-packages",
            "package-manage",
            "package-view",
        ],
        description=f"charmhub.io - {user_agent}",
    )
    # hardcoded temporarily --------------------
    # callback_url = flask.url_for("auth.login_callback", _external=True)
    callback_url = "http://localhost:8045/login/callback"

    return candid_login(macaroon_response, callback_url, 'store.index')


@auth.route("/login/callback")
def login_callback():
    return candid_login_callback(
        publisher_api,
        publisher_api.exchange_macaroons,
        "/charms"
    )

@auth.route("/logout")
def charm_logout():
    return logout("/charmhub")
