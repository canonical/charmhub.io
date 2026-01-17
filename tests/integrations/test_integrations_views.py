from unittest import TestCase
from unittest.mock import patch, MagicMock
from webapp.app import app
from datetime import datetime


class TestIntegrationviews(TestCase):
    def setUp(self):
        self.app = app
        self.app.config["SERVER_NAME"] = "localhost.localdomain"
        self.client = self.app.test_client()
        self.context = self.app.app_context()
        self.context.push()

    def tearDown(self):
        self.context.pop()

    @patch("webapp.integrations.logic.Interfaces.get_interfaces")
    @patch("webapp.integrations.logic.Interfaces.repo")
    def test_get_interfaces(self, mock_repo, mock_get_interfaces):
        mock_get_interfaces.return_value = [
            {
                "name": "test_interface",
                "readme_path": "path/to/readme",
                "status": "live",
            }
        ]

        mock_content = MagicMock()
        readme_content = "Mock README content"
        mock_content.decoded_content.decode.return_value = readme_content
        mock_repo.get_contents.return_value = mock_content

        response = self.client.get("/integrations.json")
        self.assertEqual(response.status_code, 200)
        json_data = response.json

        self.assertIn("interfaces", json_data)
        self.assertIsInstance(json_data["interfaces"], list)

        self.assertEqual(
            len(json_data["interfaces"]),
            1,
            "Expected 1 interface in the response",
        )
        if json_data["interfaces"]:
            first_interface = json_data["interfaces"][0]
            self.assertEqual(
                first_interface["name"],
                "test_interface",
                "Interface name does not match expected value",
            )
            self.assertEqual(
                first_interface["status"],
                "live",
                "Interface status does not match expected value",
            )

    @patch("webapp.integrations.views.fetch_interface_details")
    def test_get_single_interface_found(self, mock_fetch_interface_details):
        mock_fetch_interface_details.return_value = {
            "name": "test-interface",
            "body": "<p>Mocked body</p>",
            "charms": {
                "providers": ["charm-a"],
                "requirers": ["charm-b"],
            },
            "other_charms": {
                "providers": [],
                "requirers": [],
            },
            "last_modified": datetime.now().isoformat(),
            "status": "live",
            "version": 1,
        }

        response = self.client.get("/integrations/test-interface")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Mocked body", response.data)

    @patch("webapp.integrations.views.fetch_interface_details")
    def test_get_single_interface_not_found(self, mock_fetch_interface_details):
        mock_fetch_interface_details.return_value = None

        response = self.client.get("/integrations/nonexistent-interface")
        self.assertEqual(response.status_code, 404)

    @patch("webapp.integrations.views.fetch_interface_details")
    def test_get_single_interface_json_found(self, mock_fetch_interface_details):
        mock_data = {
            "name": "test-interface",
            "body": "<p>Mocked body</p>",
            "charms": {
                "providers": ["charm-a"],
                "requirers": ["charm-b"],
            },
            "other_charms": {
                "providers": [],
                "requirers": [],
            },
            "last_modified": datetime.now().isoformat(),
            "status": "live",
            "version": 1,
        }

        mock_fetch_interface_details.return_value = mock_data

        response = self.client.get("/integrations/test-interface.json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), mock_data)

    @patch("webapp.integrations.views.fetch_interface_details")
    def test_get_single_interface_json_not_found(self, mock_fetch_interface_details):
        mock_fetch_interface_details.return_value = None

        response = self.client.get("/integrations/unknown.json")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {"error": "Interface not found"})
