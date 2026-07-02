import unittest
from unittest.mock import patch

from flask import render_template

from webapp.app import app


class TestStatusBanner(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.app = app
        self.client = app.test_client()

    def test_banner_rendered_when_status_banner_set(self):
        message = "Temporary Charmhub maintenance in progress."

        with patch("webapp.handlers.STATUS_BANNER", message):
            response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn('id="status-banner"', response.text)
        self.assertIn("p-notification--caution", response.text)
        self.assertIn(message, response.text)

    def test_banner_hidden_when_status_banner_empty(self):
        with patch("webapp.handlers.STATUS_BANNER", ""):
            response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('id="status-banner"', response.text)

    def test_publisher_layout_uses_floating_banner(self):
        message = "Publisher maintenance notice."

        with patch("webapp.handlers.STATUS_BANNER", message):
            with self.app.test_request_context("/test-entity/listing"):
                body = render_template(
                    "publisher/publisher.html",
                    package={
                        "name": "test-entity",
                        "publisher": {"display-name": "Test Publisher"},
                    },
                )

        self.assertIn('id="status-banner"', body)
        self.assertIn(message, body)
        self.assertIn("z-index: 201;", body)
