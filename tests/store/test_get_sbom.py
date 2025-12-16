from unittest import TestCase
from unittest.mock import patch, MagicMock
import requests
from flask import json
from webapp.app import app


class TestGetSbom(TestCase):
    """Test cases for the get_sbom function."""

    def setUp(self):
        """Set up test environment before each test."""
        app.testing = True
        self.client = app.test_client()

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_successful_response(
        self, mock_get, mock_get_endpoint_url
    ):
        """Test successful SBOM retrieval with valid JSON response."""
        # Setup mocks
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_sbom_data = {
            "spdxVersion": "SPDX-2.3",
            "dataLicense": "CC0-1.0",
            "SPDXID": "SPDXRef-DOCUMENT",
            "name": "test-charm-sbom",
            "documentNamespace": "https://example.com/test-charm",
            "packages": [
                {
                    "name": "test-package",
                    "SPDXID": "SPDXRef-Package",
                    "downloadLocation": "NOASSERTION",
                    "filesAnalyzed": False,
                }
            ],
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_sbom_data
        mock_get.return_value = mock_response

        # Make request
        response = self.client.get(
            "/download/sbom_charm_test-package_123.spdx2.3.json"
        )

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, "application/json")

        response_data = json.loads(response.data)
        self.assertEqual(response_data, mock_sbom_data)

        # Verify mocks were called correctly
        expected_path = "download/sbom_charm_test-package_123.spdx2.3.json"
        mock_get_endpoint_url.assert_called_once_with(expected_path)
        mock_get.assert_called_once_with(mock_endpoint)
        mock_response.json.assert_called_once()

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_with_hyphenated_package_id(
        self, mock_get, mock_get_endpoint_url
    ):
        """Test SBOM retrieval with hyphenated package ID."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_sbom_data = {"spdxVersion": "SPDX-2.3"}
        mock_response = MagicMock()
        mock_response.json.return_value = mock_sbom_data
        mock_get.return_value = mock_response

        response = self.client.get(
            "/download/sbom_charm_my-test-package_456.spdx2.3.json"
        )

        self.assertEqual(response.status_code, 200)

        expected_path = "download/sbom_charm_my-test-package_456.spdx2.3.json"
        mock_get_endpoint_url.assert_called_once_with(expected_path)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_with_numeric_revision(
        self, mock_get, mock_get_endpoint_url
    ):
        """Test SBOM retrieval with numeric revision."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_sbom_data = {"revision": 789}
        mock_response = MagicMock()
        mock_response.json.return_value = mock_sbom_data
        mock_get.return_value = mock_response

        response = self.client.get(
            "/download/sbom_charm_testpackage_789.spdx2.3.json"
        )

        self.assertEqual(response.status_code, 200)

        expected_path = "download/sbom_charm_testpackage_789.spdx2.3.json"
        mock_get_endpoint_url.assert_called_once_with(expected_path)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_empty_response(self, mock_get, mock_get_endpoint_url):
        """Test SBOM retrieval with empty JSON response."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_response = MagicMock()
        mock_response.json.return_value = {}
        mock_get.return_value = mock_response

        response = self.client.get(
            "/download/sbom_charm_empty-package_999.spdx2.3.json"
        )

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data, {})

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_complex_json_response(
        self, mock_get, mock_get_endpoint_url
    ):
        """Test SBOM retrieval with complex nested JSON response."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_sbom_data = {
            "spdxVersion": "SPDX-2.3",
            "dataLicense": "CC0-1.0",
            "SPDXID": "SPDXRef-DOCUMENT",
            "name": "complex-charm-sbom",
            "packages": [
                {
                    "name": "package1",
                    "SPDXID": "SPDXRef-Package1",
                    "versionInfo": "1.0.0",
                    "downloadLocation": "https://example.com/package1",
                    "licenseConcluded": "Apache-2.0",
                    "licenseDeclared": "Apache-2.0",
                },
                {
                    "name": "package2",
                    "SPDXID": "SPDXRef-Package2",
                    "versionInfo": "2.1.0",
                    "downloadLocation": "NOASSERTION",
                    "licenseConcluded": "MIT",
                    "externalRefs": [
                        {
                            "referenceCategory": "SECURITY",
                            "referenceType": "cpe23Type",
                            "referenceLocator": "cpe:2.3",
                        }
                    ],
                },
            ],
            "relationships": [
                {
                    "spdxElementId": "SPDXRef-DOCUMENT",
                    "relationshipType": "DESCRIBES",
                    "relatedSpdxElement": "SPDXRef-Package1",
                }
            ],
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_sbom_data
        mock_get.return_value = mock_response

        response = self.client.get(
            "/download/sbom_charm_complex-package_111.spdx2.3.json"
        )

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data, mock_sbom_data)
        self.assertIn("packages", response_data)
        self.assertEqual(len(response_data["packages"]), 2)
        self.assertIn("relationships", response_data)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_requests_exception_handling(
        self, mock_get, mock_get_endpoint_url
    ):
        """Test that requests exceptions are properly propagated."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        # Mock a network error
        mock_get.side_effect = requests.ConnectionError("Network unreachable")

        # The function doesn't handle exceptions, so they should propagate
        # This would result in a 500 error in Flask
        response = self.client.get(
            "/download/sbom_charm_error-package_555.spdx2.3.json"
        )

        # Flask will return 500 for unhandled exceptions
        self.assertEqual(response.status_code, 500)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.get")
    def test_get_sbom_json_decode_error(self, mock_get, mock_get_endpoint_url):
        """Test handling of invalid JSON response."""
        mock_endpoint = "https://example.com/sbom/endpoint"
        mock_get_endpoint_url.return_value = mock_endpoint

        mock_response = MagicMock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_get.return_value = mock_response

        # The function doesn't handle JSON decode errors
        response = self.client.get(
            "/download/sbom_charm_invalid-json_777.spdx2.3.json"
        )

        # Flask will return 500 for unhandled exceptions
        self.assertEqual(response.status_code, 500)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_get_sbom_endpoint_url_construction(self, mock_get_endpoint_url):
        """Test that the SBOM path is constructed correctly."""
        mock_get_endpoint_url.return_value = "https://example.com/endpoint"

        with patch("webapp.store.views.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = {}
            mock_get.return_value = mock_response

            # Test various package ID and revision combinations
            test_cases = [
                (
                    "simple",
                    "123",
                    "download/sbom_charm_simple_123.spdx2.3.json",
                ),
                (
                    "hyphen-package",
                    "456",
                    "download/sbom_charm_hyphen-package_456.spdx2.3.json",
                ),
                (
                    "under_score",
                    "789",
                    "download/sbom_charm_under_score_789.spdx2.3.json",
                ),
                (
                    "mixedCase",
                    "abc",
                    "download/sbom_charm_mixedCase_abc.spdx2.3.json",
                ),
            ]

            for id, revision, expected_path in test_cases:
                with self.subTest(package_id=id, revision=revision):
                    mock_get_endpoint_url.reset_mock()

                    self.client.get(
                        f"/download/sbom_charm_{id}_{revision}.spdx2.3.json"
                    )

                    mock_get_endpoint_url.assert_called_once_with(
                        expected_path
                    )

    def test_get_sbom_route_pattern_matching(self):
        """Test that the route correctly matches expected URL patterns."""
        with patch(
            "webapp.store.views.device_gateway_sbom.get_endpoint_url"
        ) as mock_get_endpoint_url:
            mock_get_endpoint_url.return_value = "https://example.com/endpoint"

            with patch("webapp.store.views.requests.get") as mock_get:
                mock_response = MagicMock()
                mock_response.json.return_value = {}
                mock_get.return_value = mock_response

                # Valid URLs that should match the route
                valid_urls = [
                    "/download/sbom_charm_test_123.spdx2.3.json",
                    "/download/sbom_charm_my-package_456.spdx2.3.json",
                    "/download/sbom_charm_package_name_789.spdx2.3.json",
                ]

                for url in valid_urls:
                    with self.subTest(url=url):
                        response = self.client.get(url)
                        self.assertEqual(response.status_code, 200)

                # Invalid URLs that should NOT match the route
                invalid_urls = [
                    "/download/sbom_charm_.spdx2.3.json",  # empty package_id
                    "/download/sbom_charm_test_.spdx2.3.json",  # empty rev
                    "/download/sbom_test_123.spdx2.3.json",  # wrong prefix
                    "/download/sbom_charm_test_123.json",  # wrong extension
                ]

                for url in invalid_urls:
                    with self.subTest(url=url):
                        response = self.client.get(url)
                        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    import unittest

    unittest.main()
