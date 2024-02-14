from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
import talisker
from canonicalwebteam.store_api.stores.charmstore import CharmStore

store_api = CharmStore(session=talisker.requests.get_session())


class TestGetPackages(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_get_packages(self):
        response = self.client.get("/packages.json")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"packages", response.data)

    def test_get_packages_with_query(self):
        response = self.client.get("/packages.json?q=test-query")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"q", response.data)
        self.assertIn(b"test-query", response.data)

    def test_get_packages_with_provides_and_requires(self):
        response = self.client.get(
            "/packages.json?provides=test-provides&requires=test-requires"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"provides", response.data)
        self.assertIn(b"test-provides", response.data)
        self.assertIn(b"requires", response.data)
        self.assertIn(b"test-requires", response.data)

    @patch("webapp.app.app.store_api.find")
    def test_get_packages_error_handling(self, mock_find):
        mock_find.side_effect = Exception("Mocked Error")
        with self.client as client:
            response = client.get("/packages.json")
            self.assertEqual(response.status_code, 500)

    @patch("webapp.app.app.store_api.find")
    def test_get_packages_empty_response(self, mock_find):
        mock_find.return_value = {"results": []}
        with self.client as client:
            response = client.get(
                "/packages.json?q=some-random-non-existent-package-name"
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(0, len(response.json["packages"]))
