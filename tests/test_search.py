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

    @responses.activate
    def test_all_charms(self):
        responses.add(
            responses.Response(
                method="GET",
                url=self.charmhub_api_url,
                body=json.dumps(sample_packages_api_response),
                status=200,
            )
        )

        response = self.client.get("/all-charms?q=juju&limit=3")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json["charms"]), 3)
        self.assertEqual(len(response.json), 1)
        self.assertIsInstance(response.json["charms"], list)
        self.assertNotIn("bundles", response.json)
        self.assertNotIn("docs", response.json)
        self.assertNotIn("topics", response.json)

    @responses.activate
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

    @patch("webapp.search.views.search_topics")
    @patch("webapp.search.views.search_docs")
    @patch("webapp.search.views.search_bundles")
    @patch("webapp.search.views.search_charms")
    def test_search(
        self,
        mock_search_charms,
        mock_search_bundles,
        mock_search_docs,
        mock_search_topics,
    ):
        mock_search_charms.return_value = sample_charms["charms"]
        mock_search_bundles.return_value = sample_bundles["bundles"]
        mock_search_docs.return_value = sample_docs["docs"]
        mock_search_topics.return_value = sample_topics["topics"]

        all_search_response = self.client.get("/all-search.json?q=test")

        self.assertEqual(all_search_response.status_code, 200)
        self.assertIn("docs", all_search_response.json)
        self.assertIn("charms", all_search_response.json)
        self.assertIn("bundles", all_search_response.json)
        self.assertIn("topics", all_search_response.json)
        self.assertIsInstance(all_search_response.json["charms"], list)
        self.assertIsInstance(all_search_response.json["bundles"], list)
        self.assertIsInstance(all_search_response.json["docs"], list)
        self.assertIsInstance(all_search_response.json["topics"], list)

        self.assertEqual(all_search_response.status_code, 200)
        self.assertLessEqual(len(all_search_response.json["docs"]), 5)
        self.assertIn("path", all_search_response.json["docs"][0])

        self.assertTrue(
            all(
                topic.get("archived", False) is not True
                for topic in all_search_response.json["topics"]
            )
        )

    @patch("webapp.search.views.search_docs")
    def test_search_all_docs(self, mock_search_docs):
        mock_search_docs.return_value = sample_docs["docs"]
        all_docs_response = self.client.get("/all-docs?q=test")

        self.assertEqual(all_docs_response.status_code, 200)
        self.assertIn("docs", all_docs_response.json)
        self.assertIsInstance(all_docs_response.json["docs"], list)
        self.assertEqual(len(all_docs_response.json["docs"]), 2)

    @patch("webapp.search.views.search_topics")
    def test_search_all_topics(self, mock_search_topics):
        mock_search_topics.return_value = sample_topics["topics"]
        all_topics_response = self.client.get("/all-topics?q=test")

        self.assertEqual(all_topics_response.status_code, 200)
        self.assertIn("topics", all_topics_response.json)
        self.assertIn("total_pages", all_topics_response.json)
        self.assertEqual(all_topics_response.json["total_pages"], 1)
        self.assertIsInstance(all_topics_response.json["topics"], list)
        self.assertEqual(len(all_topics_response.json["topics"]), 5)

    @patch("webapp.search.views.search_topics")
    @patch("webapp.search.views.search_docs")
    @patch("webapp.search.views.search_bundles")
    @patch("webapp.search.views.search_charms")
    def test_search_with_limit(
        self,
        mock_search_charms,
        mock_search_bundles,
        mock_search_docs,
        mock_search_topics,
    ):
        mock_search_charms.return_value = sample_charms["charms"]
        mock_search_bundles.return_value = sample_bundles["bundles"]
        mock_search_docs.return_value = sample_docs["docs"]
        mock_search_topics.return_value = sample_topics["topics"]

        response = self.client.get("/all-search.json?q=test&limit=2")

        self.assertEqual(response.status_code, 200)
        self.assertIn("charms", response.json)
        self.assertIsInstance(response.json["charms"], list)
        self.assertEqual(len(response.json["charms"]), 2)
        self.assertIn("bundles", response.json)
        self.assertIsInstance(response.json["bundles"], list)
        self.assertEqual(len(response.json["bundles"]), 2)
        self.assertIn("docs", response.json)
        self.assertIsInstance(response.json["docs"], list)
        self.assertEqual(len(response.json["docs"]), 2)
        self.assertIn("topics", response.json)
        self.assertIsInstance(response.json["topics"], list)
        self.assertEqual(len(response.json["topics"]), 2)
