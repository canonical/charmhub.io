import unittest
from flask import session

import talisker
from canonicalwebteam.candid import CandidClient
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from webapp.app import app
import responses

request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)


class TestLoginViews(unittest.TestCase):
    def setUp(self):
        self.app = app
        app.config["TESTING"] = True
        self.app.config["WTF_CSRF_ENABLED"] = []

        self.client = self.app.test_client()
        self.api_url = "https://api.charmhub.io/v1/tokens"

    def test_login(self):
        with self.client as client:
            res = client.get("/login")
            self.assertEqual(res.status_code, 302)
            self.assertIn("account-macaroon", session)

    def test_login_next(self):
        with self.client as client:
            client.get("/login?next=/test-page")
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
            self.assertEqual(response.location, "http://localhost/")
            self.assertEqual(s.get("account-auth"), None)
            self.assertEqual(s.get("account-macaroon"), None)
