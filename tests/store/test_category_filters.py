from unittest import TestCase
from unittest.mock import patch

from webapp.packages.logic import fetch_packages


class CategoryFiltersTests(TestCase):
    @patch("webapp.packages.logic.redis_cache")
    @patch("webapp.packages.logic.publisher_gateway")
    @patch("webapp.packages.logic.parse_package_for_card", side_effect=lambda p: p)
    def test_multiple_categories_match_either_and_preserve_platform_filter(
        self, parse, gateway, cache
    ):
        cache.get.return_value = None
        packages = [
            {
                "name": "database",
                "result": {
                    "categories": [{"name": "databases"}],
                    "deployable-on": ["kubernetes"],
                },
            },
            {
                "name": "storage",
                "result": {
                    "categories": [{"name": "storage"}],
                    "deployable-on": ["kubernetes"],
                },
            },
            {
                "name": "both",
                "result": {
                    "categories": [{"name": "databases"}, {"name": "storage"}],
                    "deployable-on": ["kubernetes"],
                },
            },
            {"name": "uncategorized", "result": {"categories": []}},
            {
                "name": "machine",
                "result": {"categories": [{"name": "storage"}]},
            },
        ]
        gateway.find.return_value = {"results": packages}

        result = fetch_packages(
            [],
            {"categories": "databases,storage", "platforms": "kubernetes"},
        )

        self.assertEqual([p["name"] for p in result], ["database", "storage", "both"])
        self.assertEqual(gateway.find.call_args.kwargs["category"], "")
