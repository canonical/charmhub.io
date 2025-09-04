import unittest
from unittest.mock import patch, MagicMock
from webapp.solutions.logic import (
    get_solution_from_backend,
    get_publisher_solutions,
    publisher_has_solutions,
)


class TestSolutionsLogic(unittest.TestCase):
    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_success(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "uuid": "123",
            "name": "Test Solution",
        }
        mock_session.get.return_value = mock_response

        result = get_solution_from_backend("123")

        self.assertEqual(result, {"uuid": "123", "name": "Test Solution"})
        mock_session.get.assert_called_once_with(
            "http://localhost:5000/api/solutions/preview/123", timeout=5
        )

    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_not_found(self, mock_session):
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_session.get.return_value = mock_response

        result = get_solution_from_backend("nonexistent")

        self.assertIsNone(result)

    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_exception(self, mock_session):
        mock_session.get.side_effect = Exception("Network error")

        result = get_solution_from_backend("123")

        self.assertIsNone(result)

    @patch("webapp.solutions.logic.session")
    @patch("webapp.solutions.logic.login")
    def test_get_publisher_solutions_success(self, mock_login, mock_session):
        mock_login.return_value = "fake-token"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"uuid": "solution1", "name": "Solution 1"}
        ]
        mock_session.get.return_value = mock_response

        result = get_publisher_solutions("testuser")

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "Solution 1")
        mock_login.assert_called_once_with("testuser")
        mock_session.get.assert_called_once_with(
            "http://localhost:5000/api/publisher/solutions",
            headers={"Authorization": "Bearer fake-token"},
            timeout=5,
        )

    @patch("webapp.solutions.auth.login")
    def test_get_publisher_solutions_auth_failure(self, mock_login):
        mock_login.side_effect = Exception("Auth failed")

        result = get_publisher_solutions("testuser")

        self.assertEqual(result, [])

    @patch("webapp.solutions.logic.get_publisher_solutions")
    def test_publisher_has_solutions_true(self, mock_get_solutions):
        mock_get_solutions.return_value = [{"uuid": "solution1"}]
        
        mock_session = {}
        with patch("flask.session", mock_session):
            result = publisher_has_solutions("testuser")

        self.assertTrue(result)
        # Verify cache was set
        self.assertEqual(mock_session["has_solutions_testuser"], True)

    @patch("webapp.solutions.logic.get_publisher_solutions")
    def test_publisher_has_solutions_false(self, mock_get_solutions):
        mock_get_solutions.return_value = []
        
        mock_session = {}
        with patch("flask.session", mock_session):
            result = publisher_has_solutions("testuser")

        self.assertFalse(result)
        # Verify cache was set
        self.assertEqual(mock_session["has_solutions_testuser"], False)
