import copy
from unittest import TestCase
from unittest.mock import patch

from mock_data.mock_store_logic import sample_package_detail
from webapp.app import app


def make_revision(revision, created_at="2024-08-07T10:21:41.554301"):
    return {
        "revision": revision,
        "created-at": created_at,
        "download": {"hash-sha-256": f"{revision:02d}" * 32, "size": 501},
    }


@patch("webapp.store.views.publisher_gateway.session.get")
@patch(
    "webapp.store.views.publisher_gateway.process_response",
    return_value={"ImageName": "registry/vault@sha256:abcdef0123456789abcd"},
)
@patch("webapp.store.views.device_gateway.get_resource_revisions")
@patch("webapp.store.views.redis_cache.get", return_value=None)
@patch("webapp.store.views.get_package_details")
class TestDetailsResource(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_renders_resource_page(
        self, mock_details, _cache, mock_revisions, _process, _get
    ):
        mock_details.return_value = copy.deepcopy(sample_package_detail)
        mock_revisions.return_value = [make_revision(83), make_revision(84)]

        response = self.client.get("/test/resources")
        body = response.get_data(as_text=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn("default resource revision for 1.16/stable", body)
        self.assertIn(
            "juju deploy test --channel 1.16/stable --trust "
            "--resources vault-image=&lt;resource revision&gt;",
            body,
        )
        self.assertEqual(body.count("p-icon--pin"), 1)
        self.assertNotIn("js-show-more-revisions", body)

    def test_uses_requested_channel(
        self, mock_details, _cache, mock_revisions, _process, _get
    ):
        mock_details.return_value = copy.deepcopy(sample_package_detail)
        mock_revisions.return_value = [make_revision(84)]

        response = self.client.get("/test/resources?channel=2/edge")

        self.assertIn(
            "default resource revision for 2/edge",
            response.get_data(as_text=True),
        )

    def test_hides_revisions_beyond_limit(
        self, mock_details, _cache, mock_revisions, _process, _get
    ):
        mock_details.return_value = copy.deepcopy(sample_package_detail)
        mock_revisions.return_value = [make_revision(r) for r in range(1, 26)]

        body = self.client.get("/test/resources").get_data(as_text=True)

        self.assertEqual(body.count("js-revision-row u-hide"), 15)
        self.assertIn("Show 10 more", body)

    def test_single_resource_url_redirects_to_anchor(
        self, _mock_details, _cache, _mock_revisions, _process, _get
    ):
        response = self.client.get("/test/resources/vault-image?channel=2/edge")

        self.assertEqual(response.status_code, 302)
        self.assertTrue(
            response.location.endswith("/test/resources?channel=2/edge#vault-image")
        )
