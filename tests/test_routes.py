import unittest
from webapp.app import app


class TestRoutes(unittest.TestCase):
    def setUp(self):
        """
        Set up Flask app for testing
        """
        app.testing = True
        self.client = app.test_client()

    def test_homepage(self):
        """
        When given the index URL,
        we should return a 200 status code
        """

        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("window.SENTRY_DSN", response.text)


if __name__ == "__main__":
    unittest.main()
