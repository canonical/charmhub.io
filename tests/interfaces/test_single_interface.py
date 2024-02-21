from unittest.mock import patch
from flask_testing import TestCase
from webapp.app import app


class TestSingleInterface(TestCase):
    def create_app(self):
        return app

    def setUp(self):
        self.app = self.create_app()
        self.client = self.app.test_client()

    def test_single_interface(self):
        response = self.client.get("/interfaces/test_interface")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"test_interface", response.data)

    @patch("webapp.interfaces.logic.Interfaces")
    @patch("webapp.app.app.store_api.find")
    def test_repo_has_no_interface(self, mock_find, mock_interfaces):
        mock_find.return_value = {
            "results": ["mock_providers", "mock_requirers"]
        }

        mock_interface_logic = mock_interfaces()
        mock_interface_logic.get_interface_list.return_value = []
        response = self.client.get("/interfaces/test_interface.json")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"other_charms", response.data)

    def test_get_single_live_interface(self):
        response = self.client.get("/interfaces/test_interface/live.json")
        self.assertEqual(response.status_code, 200)

    def test_get_single_draft_interface(self):
        response = self.client.get("/interfaces/test_interface/draft.json")
        self.assertEqual(response.status_code, 200)

    def test_single_interface_invalid_status(self):
        response = self.client.get(
            "/interfaces/test_interface/invalid_status.json"
        )
        self.assertEqual(response.status_code, 200)
