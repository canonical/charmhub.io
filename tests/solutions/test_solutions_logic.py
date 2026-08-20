import unittest
from unittest.mock import patch, MagicMock
from webapp.solutions.logic import (
    _solution_listing_item,
    get_solution_from_backend,
    get_publisher_solutions,
    group_solution_drafts,
    get_solution_categories,
    get_published_solutions,
    map_category_slugs_to_display,
    SolutionsServiceError,
)


@patch(
    "webapp.solutions.logic.SOLUTIONS_API_BASE", "http://localhost:5000/api"
)
class TestSolutionsLogic(unittest.TestCase):
    @patch("webapp.solutions.logic.redis_cache")
    @patch("webapp.solutions.logic.session")
    def test_get_published_solutions(self, mock_session, mock_cache):
        mock_cache.get.return_value = None
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {
                "id": 1,
                "name": "observability",
                "title": "Canonical Observability Stack",
                "summary": "Observe applications and infrastructure.",
                "categories": ["monitoring"],
                "media": {"icon": "https://example.com/icon.svg"},
                "deployable-on": [
                    {"platform": "kubernetes", "version": [">=1.29"]}
                ],
                "last_updated": "2026-08-17T10:48:16.021584",
                "publisher": {"display_name": "Canonical"},
                "charms": [
                    {"id": 1, "charm_name": "grafana-k8s"},
                    {"id": 2, "charm_name": "prometheus-k8s"},
                ],
                "maintainers": [{"email": "private@example.com"}],
            }
        ]
        mock_session.get.return_value = mock_response

        result = get_published_solutions()

        self.assertEqual(
            result,
            [
                {
                    "name": "observability",
                    "title": "Canonical Observability Stack",
                    "summary": "Observe applications and infrastructure.",
                    "icon": "https://example.com/icon.svg",
                    "categories": ["monitoring"],
                    "platform": "kubernetes",
                    "platform_version": [">=1.29"],
                    "last_updated": "2026-08-17T10:48:16.021584",
                    "charms": ["grafana-k8s", "prometheus-k8s"],
                    "publisher": "Canonical",
                }
            ],
        )
        mock_session.get.assert_called_once_with(
            "http://localhost:5000/api/solutions", timeout=5
        )
        mock_cache.set.assert_called_once_with("published-solutions", result, ttl=60)

    def test_solution_listing_uses_publisher_username_as_fallback(self):
        result = _solution_listing_item(
            {
                "name": "observability",
                "publisher": {"display_name": "", "username": "canonical"},
            }
        )

        self.assertEqual(result["publisher"], "canonical")

    @patch("webapp.solutions.logic.redis_cache")
    @patch("webapp.solutions.logic.session")
    def test_get_published_solutions_uses_empty_cached_list(
        self, mock_session, mock_cache
    ):
        mock_cache.get.return_value = []

        result = get_published_solutions()

        self.assertEqual(result, [])
        mock_session.get.assert_not_called()

    @patch("webapp.solutions.logic.redis_cache")
    @patch("webapp.solutions.logic.session")
    def test_get_published_solutions_rejects_service_error(
        self, mock_session, mock_cache
    ):
        mock_cache.get.return_value = None
        mock_response = MagicMock()
        mock_response.status_code = 503
        mock_response.text = "Service unavailable"
        mock_session.get.return_value = mock_response

        with self.assertLogs("webapp.solutions.logic", level="WARNING") as logs:
            with self.assertRaises(SolutionsServiceError):
                get_published_solutions()

        self.assertIn(
            "Solutions service returned status 503: Service unavailable",
            logs.output[0],
        )
        mock_cache.set.assert_not_called()

    @patch("webapp.solutions.logic.redis_cache")
    @patch("webapp.solutions.logic.session")
    def test_get_published_solutions_rejects_invalid_response(
        self, mock_session, mock_cache
    ):
        mock_cache.get.return_value = None
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"solutions": []}
        mock_session.get.return_value = mock_response

        with self.assertLogs("webapp.solutions.logic", level="WARNING") as logs:
            with self.assertRaises(SolutionsServiceError):
                get_published_solutions()

        self.assertIn(
            "Solutions service returned dict instead of a list",
            logs.output[0],
        )
        mock_cache.set.assert_not_called()

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
        mock_session.get.assert_called_once()

    @patch(
        "webapp.solutions.logic.flask_session",
        {"account": {"username": "testuser"}},
    )
    @patch("webapp.solutions.logic.make_authenticated_request")
    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_prefers_authenticated_solution(
        self, mock_session, mock_auth_request
    ):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "hash": "123",
            "name": "Test Solution",
            "creator": {"email": "creator@example.com"},
        }
        mock_auth_request.return_value = mock_response

        result = get_solution_from_backend("123", prefer_authenticated=True)

        self.assertEqual(result["creator"]["email"], "creator@example.com")
        mock_auth_request.assert_called_once()
        mock_session.get.assert_not_called()

    @patch(
        "webapp.solutions.logic.flask_session",
        {"account": {"username": "testuser"}},
    )
    @patch("webapp.solutions.logic.make_authenticated_request")
    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_falls_back_to_public_preview(
        self, mock_session, mock_auth_request
    ):
        mock_auth_request.side_effect = Exception("Auth failed")
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "uuid": "123",
            "name": "Test Solution",
        }
        mock_session.get.return_value = mock_response

        result = get_solution_from_backend("123", prefer_authenticated=True)

        self.assertEqual(result, {"uuid": "123", "name": "Test Solution"})
        mock_session.get.assert_called_once()

    @patch(
        "webapp.solutions.logic.flask_session",
        {"account": {"username": "testuser"}},
    )
    @patch("webapp.solutions.logic.make_authenticated_request")
    @patch("webapp.solutions.logic.session")
    def test_get_solution_from_backend_falls_back_when_auth_hash_not_found(
        self, mock_session, mock_auth_request
    ):
        mock_auth_response = MagicMock()
        mock_auth_response.status_code = 404
        mock_auth_response.json.return_value = {"error": "Solution not found"}
        mock_auth_request.return_value = mock_auth_response

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "uuid": "123",
            "name": "Test Solution",
        }
        mock_session.get.return_value = mock_response

        result = get_solution_from_backend("123", prefer_authenticated=True)

        self.assertEqual(result, {"uuid": "123", "name": "Test Solution"})
        mock_session.get.assert_called_once()

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

    @patch("webapp.solutions.logic.flask_session", {})
    @patch("webapp.solutions.logic.session")
    @patch("webapp.solutions.logic.login")
    def test_get_publisher_solutions_success(self, mock_login, mock_session):
        mock_login.return_value = "fake-token"
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [
            {"uuid": "solution1", "name": "Solution 1"}
        ]
        mock_session.request.return_value = mock_response

        result = get_publisher_solutions("testuser")

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["name"], "Solution 1")
        mock_login.assert_called_once_with("testuser")
        mock_session.request.assert_called_once()

    @patch("webapp.solutions.auth.login")
    def test_get_publisher_solutions_auth_failure(self, mock_login):
        mock_login.side_effect = Exception("Auth failed")

        result = get_publisher_solutions("testuser")

        self.assertEqual(result, [])

    def test_group_solution_drafts_attaches_draft_to_published(self):
        published = {"name": "sol", "hash": "pub", "status": "published"}
        draft = {
            "name": "sol",
            "hash": "draft",
            "status": "draft",
            "revision": 2,
            "last_updated": "2026-01-01",
        }

        result = group_solution_drafts([published, draft])

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["hash"], "pub")
        self.assertEqual(
            result[0]["draft_update"],
            {"hash": "draft", "revision": 2, "last_updated": "2026-01-01"},
        )

    def test_group_solution_drafts_standalone_draft_without_published(self):
        draft = {
            "name": "sol",
            "hash": "draft",
            "status": "draft",
            "revision": 2,
        }

        result = group_solution_drafts([draft])

        self.assertEqual(len(result), 1)
        self.assertTrue(result[0]["is_draft_update"])

    def test_group_solution_drafts_rev1_draft_is_untouched(self):
        draft = {
            "name": "sol",
            "hash": "draft",
            "status": "draft",
            "revision": 1,
        }

        result = group_solution_drafts([draft])

        self.assertEqual(len(result), 1)
        self.assertNotIn("is_draft_update", result[0])
        self.assertNotIn("draft_update", result[0])

    def test_group_solution_drafts_published_without_draft(self):
        published = {"name": "sol", "hash": "pub", "status": "published"}

        result = group_solution_drafts([published])

        self.assertEqual(len(result), 1)
        self.assertNotIn("draft_update", result[0])

    def test_group_solution_drafts_preserves_unrelated_solutions(self):
        published = {"name": "a", "hash": "a-pub", "status": "published"}
        draft = {
            "name": "a",
            "hash": "a-draft",
            "status": "draft",
            "revision": 2,
        }
        other = {"name": "b", "hash": "b-pub", "status": "published"}
        pending = {"name": "c", "hash": "c", "status": "pending_metadata_review"}

        result = group_solution_drafts([published, draft, other, pending])

        result_hashes = {solution["hash"] for solution in result}
        self.assertEqual(result_hashes, {"a-pub", "b-pub", "c"})
        attached = next(s for s in result if s["hash"] == "a-pub")
        self.assertEqual(attached["draft_update"]["hash"], "a-draft")


class TestSolutionCategories(unittest.TestCase):
    CONFIG = [{"slug": "cloud", "name": "Cloud"}]

    @patch("webapp.solutions.logic.get_store_categories")
    def test_get_solution_categories_maps_store_shape(self, mock_store):
        mock_store.return_value = [
            {"name": "ai-ml", "display_name": "AI/ML"},
            {"name": "monitoring", "display_name": "Monitoring"},
        ]

        result = get_solution_categories()

        self.assertEqual(
            result,
            [
                {"slug": "ai-ml", "name": "AI/ML"},
                {"slug": "monitoring", "name": "Monitoring"},
            ],
        )

    @patch("webapp.solutions.logic.CATEGORIES", CONFIG)
    @patch("webapp.solutions.logic.get_store_categories")
    def test_get_solution_categories_falls_back_to_config(self, mock_store):
        mock_store.return_value = []

        result = get_solution_categories()

        self.assertEqual(result, [{"slug": "cloud", "name": "Cloud"}])

    @patch("webapp.solutions.logic.CATEGORIES", CONFIG)
    @patch("webapp.solutions.logic.get_store_categories")
    def test_get_solution_categories_falls_back_on_store_error(
        self, mock_store
    ):
        mock_store.side_effect = Exception("store down")

        result = get_solution_categories()

        self.assertEqual(result, [{"slug": "cloud", "name": "Cloud"}])

    @patch("webapp.solutions.logic.get_store_categories")
    def test_map_category_slugs_to_display_known_slugs(self, mock_store):
        mock_store.return_value = [
            {"name": "ai-ml", "display_name": "AI/ML"},
            {"name": "monitoring", "display_name": "Monitoring"},
        ]

        result = map_category_slugs_to_display(["monitoring", "ai-ml"])

        self.assertEqual(
            result,
            [
                {"slug": "monitoring", "name": "Monitoring"},
                {"slug": "ai-ml", "name": "AI/ML"},
            ],
        )

    @patch("webapp.solutions.logic.get_store_categories")
    def test_map_category_slugs_to_display_unknown_slug_fallback(
        self, mock_store
    ):
        mock_store.return_value = [{"name": "ai-ml", "display_name": "AI/ML"}]

        result = map_category_slugs_to_display(["made-up-slug"])

        self.assertEqual(
            result, [{"slug": "made-up-slug", "name": "Made Up Slug"}]
        )

    def test_map_category_slugs_to_display_empty(self):
        self.assertEqual(map_category_slugs_to_display([]), [])
        self.assertEqual(map_category_slugs_to_display(None), [])
