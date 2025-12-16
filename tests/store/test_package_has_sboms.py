from unittest import TestCase
from unittest.mock import patch, MagicMock
import requests
from webapp.store.views import package_has_sboms


class TestPackageHasSboms(TestCase):
    """Test cases for the package_has_sboms function."""

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_with_empty_revisions(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function returns False when revisions list is empty."""
        result = package_has_sboms([], "test-package-id")

        self.assertFalse(result)
        mock_get_endpoint_url.assert_not_called()
        mock_head.assert_not_called()

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_with_none_revisions(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function returns False when revisions is None."""
        result = package_has_sboms(None, "test-package-id")

        self.assertFalse(result)
        mock_get_endpoint_url.assert_not_called()
        mock_head.assert_not_called()

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_returns_true_for_status_200(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function returns True when HEAD request returns 200."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_head.return_value = mock_response

        # Test data
        revisions = ["revision-1", "revision-2", "revision-3"]
        package_id = "test-package-id"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertTrue(result)
        mock_get_endpoint_url.assert_called_once_with(
            "download/sbom_charm_test-package-id_revision-1.spdx2.3.json"
        )
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_returns_true_for_status_302(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function returns True when HEAD request returns 302."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = MagicMock()
        mock_response.status_code = 302
        mock_head.return_value = mock_response

        # Test data
        revisions = ["revision-1"]
        package_id = "another-package-id"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertTrue(result)
        mock_get_endpoint_url.assert_called_once_with(
            "download/sbom_charm_another-package-id_revision-1.spdx2.3.json"
        )
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_returns_false_for_status_404(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function returns False when HEAD request returns 404."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_head.return_value = mock_response

        # Test data
        revisions = ["revision-1"]
        package_id = "test-package-id"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertFalse(result)
        mock_get_endpoint_url.assert_called_once_with(
            "download/sbom_charm_test-package-id_revision-1.spdx2.3.json"
        )
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_uses_first_revision_only(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function only checks the first revision in the list."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_head.return_value = mock_response

        # Test data with multiple revisions
        revisions = ["first-revision", "second-revision", "third-revision"]
        package_id = "test-package-id"

        result = package_has_sboms(revisions, package_id)

        # Assertions - should only check first revision
        self.assertTrue(result)
        mock_get_endpoint_url.assert_called_once_with(
            "download/sbom_charm_test-package-id_first-revision.spdx2.3.json"
        )
        mock_head.assert_called_once()

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_handles_request_exception(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function handles request exceptions gracefully."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_head.side_effect = requests.RequestException("Network error")

        # Test data
        revisions = ["revision-1"]
        package_id = "test-package-id"

        # This should raise the exception as the function doesn't handle it
        with self.assertRaises(requests.RequestException):
            package_has_sboms(revisions, package_id)

    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    @patch("webapp.store.views.requests.head")
    def test_package_has_sboms_constructs_correct_path(
        self, mock_head, mock_get_endpoint_url
    ):
        """Test that function constructs the correct SBOM path."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_head.return_value = mock_response

        # Test with specific package ID and revision
        revisions = ["abc123"]
        package_id = "my-special-charm"

        package_has_sboms(revisions, package_id)

        # Verify the path construction
        expected_path = (
            "download/sbom_charm_my-special-charm_abc123.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_path)


if __name__ == "__main__":
    import unittest

    unittest.main()
