import unittest
from unittest.mock import patch, Mock
from webapp.store.views import package_has_sboms


class TestPackageHasSboms(unittest.TestCase):
    """Test cases for the package_has_sboms function."""

    def test_package_has_sboms_no_revisions(self):
        """Test that function returns False when revisions is empty or None."""
        # Test with None
        result = package_has_sboms(None, "test-package-123")
        self.assertFalse(result)

        # Test with empty list
        result = package_has_sboms([], "test-package-123")
        self.assertFalse(result)

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_success_200(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test that function returns True when HEAD request returns 200."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_head.return_value = mock_response

        revisions = ["revision-123"]
        package_id = "test-package-456"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertTrue(result)
        expected_sbom_path = (
            f"download/sbom_charm_{package_id}_{revisions[0]}.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_sbom_path)
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_success_302(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test that function returns True when HEAD request returns 302."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = Mock()
        mock_response.status_code = 302
        mock_head.return_value = mock_response

        revisions = ["revision-789"]
        package_id = "test-package-abc"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertTrue(result)
        expected_sbom_path = (
            f"download/sbom_charm_{package_id}_{revisions[0]}.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_sbom_path)
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_failure_404(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test that function returns False when HEAD request returns 404."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = Mock()
        mock_response.status_code = 404
        mock_head.return_value = mock_response

        revisions = ["revision-456"]
        package_id = "test-package-def"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertFalse(result)
        expected_sbom_path = (
            f"download/sbom_charm_{package_id}_{revisions[0]}.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_sbom_path)
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_failure_500(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test that function returns False when HEAD request returns 500."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = Mock()
        mock_response.status_code = 500
        mock_head.return_value = mock_response

        revisions = ["revision-999"]
        package_id = "test-package-xyz"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertFalse(result)
        expected_sbom_path = (
            f"download/sbom_charm_{package_id}_{revisions[0]}.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_sbom_path)
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_multiple_revisions_uses_first(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test that function uses only the first revision when multiple"""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_response = Mock()
        mock_response.status_code = 200
        mock_head.return_value = mock_response

        revisions = ["first-revision", "second-revision", "third-revision"]
        package_id = "multi-revision-package"

        result = package_has_sboms(revisions, package_id)

        # Assertions
        self.assertTrue(result)
        # Should use only the first revision
        expected_sbom_path = (
            f"download/sbom_charm_{package_id}_first-revision.spdx2.3.json"
        )
        mock_get_endpoint_url.assert_called_once_with(expected_sbom_path)
        mock_head.assert_called_once_with("https://example.com/sbom/path")

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_request_exception_returns_false(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test function returns False when requests.head raises exception."""
        # Setup mocks
        mock_get_endpoint_url.return_value = "https://example.com/sbom/path"
        mock_head.side_effect = Exception("Network error")

        revisions = ["revision-error"]
        package_id = "error-package"

        # Function should handle exceptions gracefully and return False
        with self.assertRaises(Exception):
            package_has_sboms(revisions, package_id)

    @patch("webapp.store.views.requests.head")
    @patch("webapp.store.views.device_gateway_sbom.get_endpoint_url")
    def test_package_has_sboms_edge_cases(
        self, mock_get_endpoint_url, mock_head
    ):
        """Test edge cases with various status codes."""
        test_cases = [
            (100, False),  # Continue
            (201, False),  # Created
            (301, False),  # Moved Permanently
            (400, False),  # Bad Request
            (401, False),  # Unauthorized
            (403, False),  # Forbidden
            (418, False),  # I'm a teapot
        ]

        for status_code, expected_result in test_cases:
            with self.subTest(status_code=status_code):
                # Reset mocks
                mock_get_endpoint_url.reset_mock()
                mock_head.reset_mock()

                # Setup mocks
                mock_get_endpoint_url.return_value = (
                    "https://example.com/sbom/path"
                )
                mock_response = Mock()
                mock_response.status_code = status_code
                mock_head.return_value = mock_response

                revisions = ["test-revision"]
                package_id = f"test-package-{status_code}"

                result = package_has_sboms(revisions, package_id)
                self.assertEqual(result, expected_result)


if __name__ == "__main__":
    unittest.main()
