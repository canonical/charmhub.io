from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
import talisker


class TestGetPublisherDetails(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_get_publisher_details(self):
        response = self.client.get("/publisher/test-publisher")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"publisher", response.data)
        self.assertIn(b"test-publisher", response.data)
        self.assertIn(b"charms", response.data)
        self.assertIn(b"charms_count", response.data)
        self.assertIn(b"error_info", response.data)

    @patch("webapp.app.app.store_api.find")
    def test_get_publisher_details_error_handling(self, mock_find):
        mock_find.side_effect = Exception("Mocked Error")
        with self.client as client:
            with self.assertRaises(Exception) as context:
                response = client.get("/publisher/test-publisher")
                self.assertEqual(str(context.exception), "Mocked Error")
                self.assertEqual(response.status_code, 500)

    @patch("webapp.app.app.store_api.find")
    def test_get_publisher_details_empty_response(self, mock_find):
        mock_find.return_value = {"results": []}
        with self.client as client:
            response = client.get("/publisher/test-publisher")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(0, len(response.json["charms"]))
            self.assertEqual(0, response.json["charms_count"])
            self.assertEqual(0, len(response.json["error_info"]))
            self.assertEqual(
                "test-publisher", response.json["publisher"]["display-name"]
            )
            self.assertIn(b"publisher", response.data)
            self.assertIn(b"test-publisher", response.data)
            self.assertIn(b"charms", response.data)
            self.assertIn(b"charms_count", response.data)
            self.assertIn(b"error_info", response.data)
