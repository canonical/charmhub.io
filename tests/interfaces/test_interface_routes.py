from unittest import TestCase
from unittest.mock import patch, MagicMock
from webapp.app import app


class TestInterfaceRoutes(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch("webapp.interfaces.logic.Interfaces.get_interfaces")
    @patch("webapp.interfaces.logic.github_client.get_repo")
    def test_get_interfaces(self, mock_get_repo, mock_get_interfaces):
        mock_get_interfaces.return_value = [
            {
                "name": "test_interface",
                "readme_path": "path/to/readme",
                "status": "live",
            }
        ]

        mock_repo = MagicMock()
        mock_content = MagicMock()
        readme_content = "Mock README content"
        mock_content.decoded_content.decode.return_value = readme_content
        mock_repo.get_contents.return_value = mock_content
        mock_get_repo.return_value = mock_repo

        response = self.client.get("/interfaces.json")
        self.assertEqual(response.status_code, 200)
        json_data = response.json

        self.assertIn("interfaces", json_data)
        self.assertIsInstance(json_data["interfaces"], list)
        for interface in json_data["interfaces"]:
            self.assertIn("description", interface)
            self.assertIsInstance(interface["description"], str)
        self.assertEqual(
            len(json_data["interfaces"]),
            1,
            "Expected 1 interface in the response"
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
