from unittest import TestCase
from unittest.mock import patch, MagicMock
from webapp.app import app
from flask import url_for


class TestInterfaceRoutes(TestCase):
    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.app.config["SERVER_NAME"] = "localhost.localdomain"
        self.client = self.app.test_client()
        self.context = self.app.app_context()
        self.context.push()

    def tearDown(self):
        self.context.pop()

    @patch("webapp.integrations.logic.Interfaces.get_interfaces")
    @patch("webapp.integrations.logic.github_client.get_repo")
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

    @patch("webapp.integrations.views.get_single_interface")
    def test_single_interface_success(self, mock_get_single_interface):
        mock_response = MagicMock()
        mock_response.data.decode.return_value = (
            '{"interface": {"name": "test_interface"}, "status": "live"}'
        )
        mock_get_single_interface.return_value = mock_response

        response = self.client.get(
            url_for("integrations.single_interface", path="test_interface")
        )

        self.assertEqual(response.status_code, 200)
        mock_get_single_interface.assert_called_with("test_interface", "")

    @patch("webapp.integrations.views.get_single_interface")
    def test_single_interface_draft_redirect(self, mock_get_single_interface):
        mock_response = MagicMock()
        mock_response.data.decode.return_value = (
            '{"name": "test_interface","status": "draft"}'
        )
        mock_get_single_interface.return_value = mock_response

        response = self.client.get(
            url_for("integrations.single_interface", path="test_interface")
        )

        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.location.endswith("test_interface/draft"))

    @patch("webapp.integrations.views.get_single_interface")
    def test_single_interface_not_found(self, mock_get_single_interface):
        mock_response = MagicMock()
        mock_response.data.decode.return_value = (
            '{"other_charms": {"providers": [], "requirers": []}}'
        )
        mock_get_single_interface.return_value = mock_response

        response = self.client.get(
            url_for(
                "integrations.single_interface", path="nonexistent_interface"
            )
        )
        self.assertEqual(response.status_code, 404)
