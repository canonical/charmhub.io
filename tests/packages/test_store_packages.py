from unittest import TestCase
from unittest.mock import patch

from flask import Flask

from webapp.config import HOMEPAGE_SEARCH_FIELDS
from webapp.packages.store_packages import store_packages


class TestStorePackages(TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.register_blueprint(store_packages)
        self.client = app.test_client()

    @patch("webapp.packages.store_packages.get_packages")
    def test_store_json_uses_homepage_fields(self, mock_get_packages):
        mock_get_packages.return_value = {
            "packages": [],
            "total_items": 0,
            "total_pages": 0,
            "categories": [],
        }

        response = self.client.get("/store.json")

        self.assertEqual(response.status_code, 200)
        mock_get_packages.assert_called_once_with(
            HOMEPAGE_SEARCH_FIELDS, {}, 12
        )
