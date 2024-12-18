from pprint import pprint
from unittest.mock import patch
from flask_testing import TestCase
from webapp.app import app


class TestAllInterfaces(TestCase):
    def create_app(self):
        return app

    def setUp(self):
        self.app = self.create_app()
        self.client = self.app.test_client()

    @patch("webapp.integrations.logic.Interfaces.get_interfaces")
    @patch("webapp.integrations.logic.github_client.get_repo")
    def test_interfaces_json(self, mock_get_repo, mock_get_interfaces):
        response = self.client.get("/integrations.json")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"interfaces", response.data)

    @patch("webapp.integrations.views.get_interfaces")
    def test_all_interfaces(self, mock_get_interfaces):
        mock_get_interfaces.return_value = {
            "interfaces": [
                {
                    "name": "test_interface1",
                    "summary": "test_summary1",
                    "description": "test_description1",
                },
                {
                    "name": "test_interface2",
                    "summary": "test_summary2",
                    "description": "test_description2",
                },
                {
                    "name": "test_interface3",
                    "summary": "test_summary3",
                    "description": "test_description3",
                },
                {
                    "name": "test_interface4",
                    "summary": "test_summary4",
                    "description": "test_description4",
                },
                {
                    "name": "test_interface5",
                    "summary": "test_summary5",
                    "description": "test_description5",
                },
            ],
            "size": 5,
        }
        response = self.client.get("/integrations")
        pprint(response)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"test_interface1", response.data)
        self.assertIn(b"test_interface3", response.data)
        self.assert_template_used("interfaces/index.html")
