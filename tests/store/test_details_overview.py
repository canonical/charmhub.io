from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
from mock_data.mock_store_logic import sample_package_detail
import copy


class TestDetailsOverview(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch("webapp.store.views.redis_cache.get")
    @patch("webapp.store.views.get_package_details")
    def test_details_with_discourse_link(self, mock_find, mock_cache_get):
        mock_find.return_value = sample_package_detail
        mock_cache_get.return_value = None
        response = self.client.get("/test")
        self.assertNotIn(b"Read documentation", response.data)
        self.assertEqual(response.status_code, 200)

    @patch("webapp.store.views.redis_cache.get")
    @patch("webapp.store.views.get_package_details")
    def test_details_with_readthedocs_link(self, mock_find, mock_cache_get):
        data = copy.deepcopy(sample_package_detail)
        data["result"]["links"]["docs"] = [
            "https://readthedocs.charmhub.io/t/xxx"
        ]
        mock_find.return_value = data
        mock_cache_get.return_value = None
        response = self.client.get("/test")
        self.assertIn(b"Read documentation", response.data)
        self.assertEqual(response.status_code, 200)
