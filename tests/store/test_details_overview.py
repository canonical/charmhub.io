from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
from webapp.store.views import get_libraries, get_package_details
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
        data["default-release"]["revision"][
            "metadata-yaml"
        ] = """
        docs: https://readthedocs.charmhub.io/t/xxx
        """
        mock_find.return_value = data
        mock_cache_get.return_value = None
        response = self.client.get("/test")
        self.assertIn(b"Read documentation", response.data)
        self.assertEqual(response.status_code, 200)

    @patch("webapp.store.logic.process_libraries")
    @patch("webapp.store_api.publisher_gateway.get_charm_libraries")
    @patch("webapp.store.views.redis_cache.set")
    @patch("webapp.store.views.redis_cache.get", return_value=["lib1", "lib2"])
    def test_get_libraries_from_cache(
        self, _, mock_cache_set, mock_publishergw, mock_process
    ):
        result = get_libraries("test-package")
        self.assertEqual(result, ["lib1", "lib2"])
        mock_publishergw.assert_not_called()
        mock_process.assert_not_called()
        mock_cache_set.assert_not_called()

    @patch(
        "webapp.store.logic.process_libraries", return_value=["processed-lib"]
    )
    @patch(
        "webapp.store_api.publisher_gateway.get_charm_libraries",
        return_value=["raw-lib"],
    )
    @patch("webapp.store.views.redis_cache.set")
    @patch("webapp.store.views.redis_cache.get", return_value=None)
    def test_get_libraries_from_gateway_on_cache_miss(
        self, _, mock_set, mock_publishergw, mock_process
    ):
        result = get_libraries("test-package")
        self.assertEqual(result, ["processed-lib"])
        mock_publishergw.assert_called_once_with("test-package")
        mock_process.assert_called_once_with(["raw-lib"])
        mock_set.assert_called_once_with(
            "test-package:libraries", ["processed-lib"], ttl=600
        )

    @patch("webapp.store.views.redis_cache.set")
    @patch(
        "webapp.store.views.redis_cache.get",
        return_value={"name": "test-package"},
    )
    def test_get_package_details_from_cache(self, _, mock_cache_set):
        result = get_package_details(
            "test-package", "stable", fields=["result.name"]
        )
        self.assertEqual(result, {"name": "test-package"})
        mock_cache_set.assert_not_called()

    @patch(
        "webapp.store_api.device_gateway.get_item_details",
        return_value={"name": "test-package"},
    )
    @patch("webapp.store.views.redis_cache.set")
    @patch("webapp.store.views.redis_cache.get", return_value=None)
    def test_get_package_details_from_gateway_on_cache_miss(
        self, _, mock_set, mock_publishergw
    ):
        result = get_package_details(
            "test-package", "stable", fields=["result.name"]
        )
        expected_key = (
            "package_details:test-package",
            {"channel": "stable", "fields": "result.name"},
        )
        self.assertEqual(result, {"name": "test-package"})
        mock_publishergw.assert_called_once_with(
            "test-package", channel="stable", fields=["result.name"]
        )
        mock_set.assert_called_once_with(
            expected_key, {"name": "test-package"}, ttl=600
        )
