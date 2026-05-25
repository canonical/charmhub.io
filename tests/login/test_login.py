import unittest
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import urlparse

import responses
from flask import session
from pymacaroons import Macaroon

from webapp.app import app
from webapp.login import views as login_views


def make_root_macaroon():
    root = Macaroon(location="api.staging.snapcraft.io", identifier="store-usso")
    login_host = urlparse(login_views.LOGIN_URL).hostname or login_views.LOGIN_URL
    root.add_third_party_caveat(login_host, "secret-key", "caveat-id")
    return root.serialize()


class TestLoginViews(unittest.TestCase):
    def setUp(self):
        self.app = app
        app.config["TESTING"] = True
        self.client = self.app.test_client()
        self.issue_url = login_views.publisher_gateway.get_endpoint_url(
            "tokens/usso"
        )
        self.root_macaroon = make_root_macaroon()

    @responses.activate
    @patch("webapp.login.views.open_id.try_login")
    def test_login(self, mock_try_login):
        mock_try_login.return_value = "ok"
        responses.add(
            responses.POST,
            self.issue_url,
            json={"macaroon": self.root_macaroon},
            status=200,
        )

        with self.client as client:
            res = client.get("/login")
            self.assertEqual(res.data, b"ok")
            self.assertIn("account-macaroon", session)

    @responses.activate
    @patch("webapp.login.views.open_id.try_login")
    def test_login_next(self, mock_try_login):
        mock_try_login.return_value = "ok"
        responses.add(
            responses.POST,
            self.issue_url,
            json={"macaroon": self.root_macaroon},
            status=200,
        )

        with self.client as client:
            client.get("/login?next=/test-page")
            self.assertIn("next_url", session)
            self.assertEqual(session["next_url"], "/test-page")

    @responses.activate
    @patch("webapp.login.views.open_id.try_login")
    def test_login_api_500(self, mock_try_login):
        mock_try_login.return_value = "ok"
        responses.add(
            responses.Response(method="POST", url=self.issue_url, status=500)
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

    @patch("webapp.login.views.publisher_gateway.exchange_usso_macaroons")
    @patch("webapp.login.views.publisher_gateway.macaroon_info")
    def test_login_callback(self, mock_macaroon_info, mock_exchange):
        discharge = Macaroon(
            location=urlparse(login_views.LOGIN_URL).hostname, identifier="discharge"
        ).serialize()
        mock_exchange.return_value = "account-auth-token"
        mock_macaroon_info.return_value = {"account": {"id": "test-account"}}

        with self.app.test_request_context("/login", headers={"User-Agent": "UA"}):
            session["account-macaroon"] = self.root_macaroon
            response = login_views.login_callback(
                SimpleNamespace(
                    extensions={"macaroon": SimpleNamespace(discharge=discharge)}
                )
            )

            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, "/charms")
            self.assertEqual(session["account-auth"], "account-auth-token")
            self.assertIn("account", session)

    def test_login_callback_missing_root_macaroon(self):
        discharge = Macaroon(
            location=urlparse(login_views.LOGIN_URL).hostname, identifier="discharge"
        ).serialize()

        with self.app.test_request_context("/login", headers={"User-Agent": "UA"}):
            session["next_url"] = "/integrations"
            response = login_views.login_callback(
                SimpleNamespace(
                    extensions={"macaroon": SimpleNamespace(discharge=discharge)}
                )
            )

            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, "/login?next=/integrations")
