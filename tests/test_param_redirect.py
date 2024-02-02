import unittest
from unittest.mock import MagicMock
import json
from datetime import datetime, timedelta

from webapp.helpers import param_redirect_capture, param_redirect_exec


class MockCookies:
    def __init__(self, cookie={}):
        self.cookie = cookie

    def set_cookie(self, name, data, expires):
        self.cookie[name] = {"data": data, "expires": expires}

    def get(self, name):
        return self.cookie[name]


class MockRequest:
    def __init__(self, path, args, cookies: MockCookies):
        self.path = path
        self.args = args
        self.cookies = cookies if cookies else MockCookies()


class TestParamRedirect(unittest.TestCase):
    def setUp(self):
        self.cookies = MockCookies()

    def test_param_redirect_capture_matches(self):
        """
        Test param capture works when the signature is exactly the same
        """
        req = MockRequest(
            path="/accept-invite",
            args={"package": "test", "token": "test"},
            cookies=self.cookies,
        )

        resp = req.cookies

        param_redirect_capture(req, resp)

        self.assertEqual(
            self.cookies.get("param_redirect")["data"],
            json.dumps(
                {
                    "endpoint": "/accept-invite",
                    "params": {"package": "test", "token": "test"},
                }
            ),
        )

        self.assertLess(
            self.cookies.get("param_redirect")["expires"],
            datetime.now() + timedelta(days=10),
        )

    def test_param_redirect_capture_matches_order(self):
        """
        Test param capture works when args are in a different order
        """
        req = MockRequest(
            path="/accept-invite",
            args={"token": "test", "package": "test"},
            cookies=self.cookies,
        )

        resp = req.cookies

        param_redirect_capture(req, resp)

        self.assertEqual(
            self.cookies.get("param_redirect")["data"],
            json.dumps(
                {
                    "endpoint": "/accept-invite",
                    "params": {"package": "test", "token": "test"},
                }
            ),
        )

        self.assertLess(
            self.cookies.get("param_redirect")["expires"],
            datetime.now() + timedelta(days=10),
        )

    def test_param_redirect_capture_matches_args(self):
        """
        Test param capture works when there are more arguments defined
        """
        req = MockRequest(
            path="/accept-invite",
            args={"package": "test", "token": "test", "test": "test"},
            cookies=self.cookies,
        )

        resp = req.cookies

        param_redirect_capture(req, resp)

        self.assertEqual(
            self.cookies.get("param_redirect")["data"],
            json.dumps(
                {
                    "endpoint": "/accept-invite",
                    "params": {"package": "test", "token": "test"},
                }
            ),
        )

        self.assertLess(
            self.cookies.get("param_redirect")["expires"],
            datetime.now() + timedelta(days=10),
        )

    def test_param_redirect_capture_does_not_match(self):
        """
        Test param capture doesn't capture a signature that doesn't match
        """
        req = MockRequest(
            path="/accept-invite/test",
            args={"package": "test", "token": "test"},
            cookies=self.cookies,
        )

        resp = req.cookies

        param_redirect_capture(req, resp)

        self.assertNotIn("param_redirect", self.cookies.cookie)

    def test_param_redirect_exec(self):
        """
        Tests successfuly retrieval of cookie and redirect
        """
        req = MockRequest(
            path="/accept-invite",
            args={"package": "test", "token": "test"},
            cookies=MockCookies(
                {
                    "param_redirect": json.dumps(
                        {
                            "endpoint": "/accept-invite",
                            "params": {"package": "test", "token": "test"},
                        }
                    )
                }
            ),
        )
        make_response = MagicMock()
        redirect = MagicMock()
        param_redirect_exec(
            req=req, make_response=make_response, redirect=redirect
        )

        redirect.assert_called_with("/accept-invite?package=test&token=test")

    def test_param_redirect_exec_no_match_path(self):
        """
        Tests successful continuation if the path doesn't match.
        """
        req = MockRequest(
            path="/accept-invite/test",
            args={"package": "test", "token": "test"},
            cookies=MockCookies(
                {
                    "param_redirect": json.dumps(
                        {
                            "endpoint": "/accept-invite",
                            "params": {"package": "test", "token": "test"},
                        }
                    )
                }
            ),
        )
        make_response = MagicMock()
        redirect = MagicMock()
        resp = param_redirect_exec(
            req=req, make_response=make_response, redirect=redirect
        )

        self.assertIsNone(resp)

        redirect.assert_not_called()

    def test_param_redirect_exec_no_cookie(self):
        """
        Tests successful continuation if there is no cookie.
        """
        req = MockRequest(
            path="/accept-invite",
            args={"package": "test", "token": "test"},
            cookies=MockCookies({"param_redirect": None}),
        )
        make_response = MagicMock()
        redirect = MagicMock()
        resp = param_redirect_exec(
            req=req, make_response=make_response, redirect=redirect
        )

        self.assertIsNone(resp)

        redirect.assert_not_called()


if __name__ == "__main__":
    unittest.main()
