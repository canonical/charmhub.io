import json
from base64 import standard_b64encode, urlsafe_b64encode
from os import getenv

import requests
from pymacaroons import Macaroon
from pymacaroons.serializers.json_serializer import JsonSerializer

CANDID_API_URL = getenv(
    "CANDID_API_URL", "https://api.jujucharms.com/identity/"
)


class CandidAuthenticationError(Exception):
    pass


class CandidClient:
    """
    CandidClient provides authentication with Candid, a macaroon-based
    authentication service. See: https://github.com/canonical/candid
    This client only support the browser-redirect login protocol that
    provides a mechanism for a user to authenticate with candid, and
    subsequently discharge macaroons, by redirecting a web browser via
    the candid login pages.
    """

    def __init__(self, session=requests.Session()):
        self.session = session

    def _extract_caveat_to_discharge(self, macaroon):
        """
        The macaroon will contain just one caveat to be discharge
        by candid
        """
        for caveat in macaroon.caveats:
            if caveat.location == CANDID_API_URL:
                return standard_b64encode(caveat.caveat_id)
        raise CandidAuthenticationError("Missing caveat")

    def _request(self, method, url, data=None, json=None):
        response = self.session.request(
            method=method,
            url=url,
            headers={"Bakery-Protocol-Version": "2"},
            data=data,
            json=json,
        )

        # Candid set some cookies that we do not want on the server side
        self.session.cookies.clear()

        return response

    def get_login_url(self, macaroon, callback_url, state):
        """
        To initiate the login redirect the user's browser to the URL
        specified in the LoginURL parameter. The redirect must be a GET
        request and must include a "return_to" query parameter which must
        be whitelisted in the candid server.

        The redirect should also specify a "state" query parameter. This is
        an opaque value that will be sent back to the relaying party in the
        callback. This can be useful to verify that a login attempt was
        started by the relaying party and can help guard against CSRF
        attacks.
        """
        # Deserialize the macaroon with pymacaroons
        macaroon = Macaroon.deserialize(macaroon, JsonSerializer())

        # Extract the caveat we are interested in
        caveat = self._extract_caveat_to_discharge(macaroon)

        response = self._request(
            method="POST",
            url=f"{CANDID_API_URL}discharge",
            data={"id64": caveat},
        )

        data = response.json()["Info"]["InteractionMethods"][
            "browser-redirect"
        ]

        return f"{data['LoginURL']}?return_to={callback_url}&state={state}"

    def discharge_token(self, code):
        response = self._request(
            method="POST",
            url=f"{CANDID_API_URL}discharge-token",
            json={"code": code},
        ).json()

        return response["token"]["value"]

    def discharge_macaroon(self, macaroon, token):
        # Deserialize the macaroon with pymacaroons
        macaroon = Macaroon.deserialize(macaroon, JsonSerializer())

        # Extract the caveat we are interested in
        caveat = self._extract_caveat_to_discharge(macaroon)

        data = {"id64": caveat, "token64": token, "token-kind": "macaroon"}
        response = self._request(
            method="POST", url=f"{CANDID_API_URL}discharge", data=data
        )

        return Macaroon.deserialize(
            json.dumps(response.json()["Macaroon"]), JsonSerializer()
        )

    def get_serialized_bakery_macaroon(self, macaroon, candid_macaroon):
        """
        Return a serialized string with the macaroons to consume the API
        """

        # Deserialize the macaroon with pymacaroons
        macaroon = Macaroon.deserialize(macaroon, JsonSerializer())

        # Return a new discharge macaroon bound
        bound_discharge_macaroon = macaroon.prepare_for_request(
            candid_macaroon
        )

        macaroon_json = macaroon.serialize(JsonSerializer())
        bound_macaroon_json = bound_discharge_macaroon.serialize(
            JsonSerializer()
        )

        macaroons = f"[{macaroon_json},{bound_macaroon_json}]".encode("utf-8")
        return urlsafe_b64encode(macaroons).decode("ascii")
