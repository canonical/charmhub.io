import unittest
from unittest.mock import Mock, patch

from webapp.decorators import redirect_uppercase_to_lowercase


class TestDecorators(unittest.TestCase):
    def setUp(self):
        self.mock_get_env = patch("webapp.decorators.os.getenv").start()
        self.mock_flask = patch("webapp.decorators.flask").start()

    def tearDown(self):
        patch.stopall()

    def test_redirect_uppercase_to_lowercase_random_url(self):
        """
        Test that the decorator redirects the path to lowercase
        """
        self.mock_flask.request.url.lower.return_value = (
            "http://example.com/test"
        )
        self.mock_flask.abort.return_value = Mock()
        self.mock_get_env.return_value = "devel"

        @redirect_uppercase_to_lowercase
        def test_func(entity_name):
            pass

        test_func(entity_name="Test")

        self.assertEqual(self.mock_flask.redirect.called, False)
        self.assertEqual(self.mock_flask.abort.called, True)

    def test_redirect_uppercase_to_lowercase_localhost(self):
        """
        Test that the decorator redirects the path to lowercase
        """
        self.mock_flask.request.url.lower.return_value = (
            "http://localhost:1234/test"
        )
        self.mock_get_env.return_value = "devel"

        @redirect_uppercase_to_lowercase
        def test_func(entity_name):
            pass

        test_func(entity_name="Test")
        self.mock_flask.redirect.assert_called_once_with(
            "http://localhost:1234/test"
        )

    def test_redirect_uppercase_to_lowercase_staging(self):
        """
        Test that the decorator redirects the path to lowercase
        """
        self.mock_flask.request.url.lower.return_value = (
            "https://staging.charmhub.io/test"
        )
        self.mock_get_env.return_value = "staging"

        @redirect_uppercase_to_lowercase
        def test_func(entity_name):
            pass

        test_func(entity_name="Test")
        self.mock_flask.redirect.assert_called_once_with(
            "https://staging.charmhub.io/test"
        )

    def test_redirect_uppercase_to_lowercase_production(self):
        """
        Test that the decorator redirects the path to lowercase
        """
        self.mock_flask.request.url.lower.return_value = (
            "https://charmhub.io/test"
        )
        self.mock_get_env.return_value = "production"

        @redirect_uppercase_to_lowercase
        def test_func(entity_name):
            pass

        test_func(entity_name="Test")
        self.mock_flask.redirect.assert_called_once_with(
            "https://charmhub.io/test"
        )
