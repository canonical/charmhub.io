import json
from pprint import pprint
from unittest import TestCase
from unittest.mock import Mock, patch
from urllib.parse import urlencode
from flask_caching import Cache

import requests

import responses

from webapp.app import app
# from webapp.search.logic import search_docs
from mock_data.search_mock import (
    sample_packages_api_response,
    sample_docs_api_response,
    sample_topics_api_response,
)

from urllib.parse import quote



# mock external api calls
# mock functions that are called by the endpoints
# test that real api and mocked data has the same data structure

class TestSearch(TestCase):
    def setUp(self):

        # Clear cache completely
        cache = Cache()
        cache.init_app(app, config={"CACHE_TYPE": "simple"})
        with app.app_context():
            cache.clear()

        app.config['TESTING'] = True
        app.config['DEBUG'] = True
        self.client = app.test_client()
        self.discourse_api_url = "https://discourse.charmhub.com"
        self.docs_search_url = "".join([
            "https://discourse.charmhub.io/search.json?q=juju%20",
            quote("#doc"),
            "%20tag:olm,sdk,dev",
            "&page=1"
        ])
        self.topics_search_url = "".join(
            [
                f"{self.discourse_api_url}/search.json?",
                urlencode({"q": "juju"}),

            ]
        )
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

        response1 = self.client.get("/all-charms?q=juju&type_limit=3")
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(len(response1.json["charms"]), 3)
        self.assertEqual(len(response1.json), 1)
        self.assertEqual(type((response1.json["charms"])), list)
        self.assertEqual("bundles" not in response1.json, True)
        self.assertEqual("docs" not in response1.json, True)
        self.assertEqual("topics" not in response1.json, True)

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

        bundle_response = self.client.get("/all-bundles?q=juju&type_limit=4")
        self.assertEqual(bundle_response.status_code, 200)
        self.assertEqual(len(bundle_response.json["bundles"]), 4)
        self.assertEqual(len(bundle_response.json), 1)
        self.assertEqual(type((bundle_response.json["bundles"])), list)
        self.assertEqual("charms" not in bundle_response.json, True)
        self.assertEqual("docs" not in bundle_response.json, True)
        self.assertEqual("topics" not in bundle_response.json, True)

    @patch("webapp.search.logic.search_docs")
    def test_all_docs(self, search_docs):
        search_docs.return_value = Mock()
        search_docs.return_value.ok = True
        search_docs.return_value.json.return_value = sample_docs_api_response

        docs_response1 = self.client.get("/all-docs?q=juju")
        self.assertEqual(docs_response1.status_code, 200)

    @patch("webapp.search.logic.search_topics")
    def test_all_topics(self, search_discourse):
        search_discourse.return_value = Mock()
        search_discourse.return_value.ok = True
        search_discourse.return_value.json.return_value = sample_topics_api_response

        docs_response1 = self.client.get("/all-docs?q=juju")
        pprint(docs_response1.json)
        self.assertEqual(docs_response1.status_code, 200)

    # @responses.activate
    # def test_search(self):
    #     responses.add(
    #         responses.Response(
    #             method="GET",
    #             url=self.charmhub_api_url,
    #             body=json.dumps(sample_packages_api_response),
    #             status=200,
    #         )
    #     )

    #     responses.add(
    #         responses.Response(
    #             method="GET",
    #             url=self.docs_search_url,
    #             body=json.dumps(xyz),
    #             status=200,
    #         )
    #     )

    #     # responses.add(
    #     #     responses.Response(
    #     #         method="GET",
    #     #         url=self.topics_search_url,
    #     #         body=json.dumps(sample_docs_api_response),
    #     #         status=200,
    #     #     )
    #     # )

    #     # search_response = self.client.get("/all-search")
    #     # search_res
    #     pprint(search_response.json)
    #     self.assertEqual(search_response.status_code, 200)

# test rewite topic url;
# - should take a list of topics and return a list of topics with url addded to each topic

# test all charms
# - should take a query and return a list of charms

# test all bundles
# - should take a query and return a list of bundles

# test all docs
# - should take a query and return a list of docs
# - category_ids 22 only

# test search
# - should return an error if the type is not valid
# - should return a dict of results containing keys that are the same as the types supplies
# - should return a dict containing all types if no types supplied

# test search docs
# - should return a dict containing the results of the search
# - category id exclude 22  ``
