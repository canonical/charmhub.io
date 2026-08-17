import unittest
from unittest.mock import patch

from webapp.app import app
from webapp.solutions.logic import SolutionsServiceError


class TestSolutionsViews(unittest.TestCase):
    def setUp(self):
        app.config["SERVER_NAME"] = "localhost.localdomain"
        self.client = app.test_client()

    @patch("webapp.solutions.views.get_published_solutions")
    def test_solutions_json(self, mock_get_solutions):
        mock_get_solutions.return_value = [
            {
                "name": "observability",
                "title": "Canonical Observability Stack",
            }
        ]

        response = self.client.get("/solutions.json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "solutions": [
                    {
                        "name": "observability",
                        "title": "Canonical Observability Stack",
                    }
                ],
                "size": 1,
            },
        )

    @patch("webapp.solutions.views.get_published_solutions")
    def test_solutions_json_empty(self, mock_get_solutions):
        mock_get_solutions.return_value = []

        response = self.client.get("/solutions.json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"solutions": [], "size": 0})

    @patch("webapp.solutions.views.get_published_solutions")
    def test_solutions_json_service_error(self, mock_get_solutions):
        mock_get_solutions.side_effect = SolutionsServiceError

        response = self.client.get("/solutions.json")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.get_json(), {"error": "Failed to fetch solutions"})
