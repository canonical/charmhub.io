import json
from unittest.mock import patch
from unittest import TestCase

import responses
from webapp.app import app
from webapp.integrations.logic import Interfaces

mock_interface_yaml = """
name: test_interface

version: 0
status: published

providers:
  - name: ptest_provider
    url: https://www.github.com/canonical/test_provider

requirers:
  - name: test-requirer
    url: https://www.github.com/canonical/test_requirer

"""


class TestSingleInterface(TestCase):

    def setUp(self):
        app.config["TESTING"] = True
        app.config["DEBUG"] = True
        self.client = app.test_client()
        self.test_interfaces = Interfaces()
        # mock_github_client = patch("webapp.integrations.logic.github_client")

        self.github_interfaces_url = "".join(
            [
                "https://api.github.com/repos/canonical/",
                "charm-relation-interfaces/contents/interfaces",
            ]
        )
        self.charmhub_api_get_requirers = "".join(
            [
                "https://api.charmhub.io/v2/charms/find?",
                "q=&category=&publisher=&requires=test_interface",
            ]
        )
        self.charmhub_api_get_providers = "".join(
            [
                "https://api.charmhub.io/v2/charms/find?",
                "q=&category=&publisher=&provides=test_interface",
            ]
        )

    @responses.activate
    def test_single_interface(self):
        responses.add(
            responses.Response(
                method="GET",
                url=f"{self.github_interfaces_url}/test_interface",
                body="test_interface",
                status=200,
            )
        )
        responses.add(
            responses.Response(
                method="GET",
                url=self.charmhub_api_get_requirers,
                body=json.dumps({"results": ["test_interface1"]}),
                status=200,
            )
        )
        responses.add(
            responses.Response(
                method="GET",
                url=self.charmhub_api_get_providers,
                body=json.dumps({"results": ["test_interface2"]}),
                status=200,
            )
        )
        response = self.client.get("/integrations/test_interface.json")
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            response.json,
            {
                "other_charms": {
                    "providers": ["test_interface2"],
                    "requirers": ["test_interface1"],
                }
            },
        )

    @patch("webapp.integrations.logic.Interfaces")
    @patch("webapp.app.app.store_api.find")
    def test_repo_has_no_interface(self, mock_find, mock_interfaces):
        mock_find.return_value = {
            "results": ["mock_providers", "mock_requirers"]
        }

        mock_interface_logic = mock_interfaces()
        mock_interface_logic.get_interface_list.return_value = []
        response = self.client.get("/integrations/test_interface.json")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"other_charms", response.data)
