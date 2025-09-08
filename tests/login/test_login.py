import unittest
from flask import session

from canonicalwebteam.candid import CandidClient
from webapp.app import app
import responses
import requests

request_session = requests.Session()
candid = CandidClient(request_session)

CANDID_RESPONSE = {
    "Info": {
        "InteractionMethods": {
            "browser-redirect": {
                "LoginURL": "https://snapcraft.io/",
            }
        }
    }
}

MACAROON_RESPONSE = {
    "macaroon": (
        "{\"i64\": \"AwoQv6LOwltudUSL__FvssuZfRIBMBoOCgVsb2dpbhIFbG9naW4\", "
        "\"s64\": \"eZlOdzfzQkd9By83AyksW8Rt_cZSbdJWssyZhPRORlg\", "
        "\"l\": \"api.snapcraft.io\", "
        "\"c\": [{\"i\": \"time-before 2026-09-08T13:27:59.418876Z\"}, "
        "{\"i\": \"time-since 2025-09-08T13:27:59.418876Z\"}, "
        "{\"i\": \"session-id ea67eff4-1dcb-442f-a31e-68412b6fa0cb\"}, "
        "{\"i64\": \"AoZh2j5-nfvsJYAztgZ-Mm8Ehcpi5i4qyEj3HU_MWsRvbfkAIg198sss"
        "UwTbp6HI3ok250inzlaYddeFx4E3LY5DyTjmYo0Fz5KXZhSrcI1g1Iki-BVAvO3E_"
        "luKko0KUNkxYYGKn0komrJK1DsMcjBJfBL6hCklJxtCMWGmmgt0DDQspAjjFnBfE"
        "JbTVaAjk4vY\", "
        "\"v64\": \"r57IO0tZoWHO9XXmYGze0RIIipCQW1RRSYZIRj01VQQld413guTUELM"
        "pMgGOoXPyGGFdgydIBDDEzUy1ogykimmCvtxa8VuK\", "
        "\"l\": \"https://api.jujucharms.com/identity/\"}, "
        "{\"i\": \"extra {\\\"permissions\\\": "
        "[\\\"account-register-package\\\", \\\"account-view-packages\\\", "
        "\\\"package-manage\\\", \\\"package-view\\\"]}\"}]}"
    )
}


class TestLoginViews(unittest.TestCase):
    def setUp(self):
        self.app = app
        app.config["TESTING"] = True
        self.app.config["WTF_CSRF_ENABLED"] = []

        self.client = self.app.test_client()
        self.api_url = "https://api.charmhub.io/v1/tokens"
        self.candid_url = "https://api.jujucharms.com/identity/discharge"

    @responses.activate
    def test_login(self):
        responses.add(
            responses.POST,
            self.candid_url,
            json=CANDID_RESPONSE,
            status=200,
        )
        responses.add(
            responses.POST,
            self.api_url,
            json=MACAROON_RESPONSE,
            headers={"User-Agent": "Google Chrome"},
            status=200,
        )

        with self.client as client:
            res = client.get(
                "/login",
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}
            )
            self.assertEqual(res.status_code, 302)
            self.assertIn("account-macaroon", session)

    @responses.activate
    def test_login_next(self):
        responses.add(
            responses.POST,
            self.candid_url,
            json=CANDID_RESPONSE,
            status=200,
        )
        responses.add(
            responses.POST,
            self.api_url,
            json=MACAROON_RESPONSE,
            headers={"User-Agent": "Google Chrome"},
            status=200,
        )

        with self.client as client:
            client.get(
                "/login?next=/test-page",
                headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64)"}
            )
            self.assertIn("next_url", session)
            self.assertEqual(session["next_url"], "/test-page")

    @responses.activate
    def test_login_api_500(self):
        responses.add(
            responses.Response(method="POST", url=self.api_url, status=500)
        )

        response = self.client.get("/login")

        assert len(responses.calls) == 1
        assert response.status_code == 502

    def test_logout(self):
        response = self.client.get("/logout")
        self.assertEqual(response.status_code, 302)
        with self.client.session_transaction() as s:
            self.assertEqual(response.location, "/")
            self.assertEqual(s.get("account-auth"), None)
            self.assertEqual(s.get("account-macaroon"), None)
