import json
from unittest import TestCase
from unittest.mock import patch
from urllib.parse import urlencode

import responses

from webapp.app import app
from mock_data.search_mock import (
    sample_packages_api_response,
    sample_charms,
    sample_bundles,
    sample_docs,
    sample_topics,
)


class TestSearchPackage(TestCase):
    def setUp(self):
        app.config["TESTING"] = True
        app.config["DEBUG"] = True
        self.client = app.test_client()

        self.charmhub_api_url = "".join(
            [
                "https://api.charmhub.io/v2/",
                "charms/find",
                "?q=juju&category=&publisher=&",
                urlencode(
                    {
                        "fields": "result.categories,result.summary,"
                        "result.media,result.title,"
                        "result.publisher.display-name,"
                        "default-release.revision.revision,"
                        "default-release.channel,"
                        "result.deployable-on"
                    }
                ),
            ]
        )

    def test_all_charms(self):
        responses.add(
            responses.Response(
                method="GET",
                url=self.charmhub_api_url,
                body=json.dumps(sample_packages_api_response),
                status=200,
            )
        )

        response1 = self.client.get("/all-charms?q=juju&limit=3")
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(len(response1.json["charms"]), 3)
        self.assertEqual(len(response1.json), 1)
        self.assertIsInstance(response1.json["charms"], list)
        self.assertNotIn("bundles", response1.json)
        self.assertNotIn("docs", response1.json)
        self.assertNotIn("topics", response1.json)

    def test_all_bundles(self):
        responses.add(
            responses.Response(
                method="GET",
                url=self.charmhub_api_url,
                body=json.dumps(sample_packages_api_response),
                status=200,
            )
        )

        bundle_response = self.client.get("/all-bundles?q=juju&limit=2")
        self.assertEqual(bundle_response.status_code, 200)
        self.assertEqual(len(bundle_response.json["bundles"]), 2)
        self.assertEqual(len(bundle_response.json), 1)
        self.assertEqual(type((bundle_response.json["bundles"])), list)
        self.assertNotIn("charms", bundle_response.json)
        self.assertNotIn("docs", bundle_response.json)
        self.assertNotIn("topics", bundle_response.json)


class TestAllSearchView(TestCase):
    def setUp(self):
        self.client = app.test_client()

    @patch("webapp.search.logic.search_topics")
    @patch("webapp.search.logic.search_docs")
    @patch("webapp.search.logic.search_bundles")
    @patch("webapp.search.logic.search_charms")
    def test_search(
        self,
        mock_search_charms,
        mock_search_bundles,
        mock_search_docs,
        mock_search_topics,
    ):
        mock_search_charms.return_value = sample_charms
        mock_search_bundles.return_value = sample_bundles
        mock_search_docs.return_value.json = sample_docs
        mock_search_topics.return_value = sample_topics

        all_search_response = self.client.get("/all-search.json?q=juju")
        all_docs_response = self.client.get("/all-docs?q=juju&limit=3")
        all_topics_response = self.client.get("/all-topics?q=juju")

        self.assertEqual(all_search_response.status_code, 200)
        self.assertIn("docs", all_docs_response.json)
        self.assertIn("charms", all_search_response.json)
        self.assertIn("bundles", all_search_response.json)
        self.assertIn("docs", all_search_response.json)
        self.assertIsInstance(all_search_response.json["charms"], list)
        self.assertIsInstance(all_search_response.json["bundles"], list)
        self.assertIsInstance(all_search_response.json["docs"], list)
        self.assertIsInstance(all_search_response.json["topics"], list)

        self.assertEqual(all_docs_response.status_code, 200)
        self.assertLessEqual(len(all_docs_response.json["docs"]), 3)
        self.assertIn("path", all_docs_response.json["docs"][0])

        self.assertEqual(all_topics_response.status_code, 200)
        self.assertTrue(
            all(
                topic.get("archived", False) is not True
                for topic in all_topics_response.json["topics"]
            )
        )

    @patch("webapp.search.logic.search_charms")
    def test_search_with_single_type(self, mock_search_charms):
        mock_search_charms.return_value = sample_charms
        response = self.client.get("/all-search.json?q=test&limit=2")
        data = json.loads(response.data)

        self.assertEqual(response.status_code, 200)
        self.assertIn("charms", data)
        self.assertIsInstance(data["charms"], list)
        self.assertEqual(len(data["charms"]), 2)
