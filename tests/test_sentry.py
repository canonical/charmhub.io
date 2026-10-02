import unittest
from unittest.mock import patch

from canonicalwebteam.exceptions import StoreApiTimeoutError
from webapp.app import app


class TestSentry(unittest.TestCase):
    def test_store_api_timeout_is_reported(self):
        error = Exception("store API timeout")
        handler = app.error_handler_spec[None][None][StoreApiTimeoutError]

        with app.test_request_context("/"):
            with patch("webapp.handlers.sentry_sdk.capture_exception") as capture:
                _, status_code = handler(error)

        self.assertEqual(status_code, 504)
        capture.assert_called_once_with(error)
