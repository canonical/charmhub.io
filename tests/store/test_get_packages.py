from unittest import TestCase
from unittest.mock import patch
from webapp.app import app


FIND_RESULTS = [
    {
        "default-release": {
            "channel": {
                "base": {
                    "architecture": "amd64",
                    "channel": "22.04",
                    "name": "ubuntu",
                },
                "name": "3/stable",
                "released-at": "2025-05-28T00:34:33.427207+00:00",
                "risk": "stable",
                "track": "3",
            },
            "revision": {"revision": 205},
        },
        "id": "3uPxmv77o1PrixpQFIf8o7SkOLsnMWmZ",
        "name": "kafka",
        "result": {
            "categories": [
                {
                    "featured": False,
                    "name": "databases",
                },
            ],
            "deployable-on": [],
            "media": [
                {
                    "height": None,
                    "type": "icon",
                    "url": (
                        "https://api.charmhub.io/api/v1/media/download/"
                        "charm_3uPxmv77o1PrixpQFIf8o7SkOLsnMWmZ_icon_ad"
                        "1a94cf9bb9f68614cb6c17e54e2fbd9dcc7fecc514dc60"
                        "12b7f58fb5b87f8f.png"
                    ),
                    "width": None,
                },
            ],
            "publisher": {
                "display-name": "Canonical",
                "id": "gVVkuxw4C56POG1eszt4RPR3L5Eak8XE",
                "username": "data-platform",
                "validation": "unproven",
            },
            "summary": "Charmed Apache Kafka Operator",
            "title": "Apache Kafka",
        },
        "type": "charm",
    },
    {
        "default-release": {
            "channel": {
                "base": {
                    "architecture": "amd64",
                    "channel": "22.04",
                    "name": "ubuntu",
                },
                "name": "3/stable",
                "released-at": "2025-06-02T18:45:45.026540+00:00",
                "risk": "stable",
                "track": "3",
            },
            "revision": {"revision": 82},
        },
        "id": "zGwm8mNdJ0Tb45JNDYNgiRBRlzaw66oA",
        "name": "kafka-k8s",
        "result": {
            "categories": [{"featured": False, "name": "databases"}],
            "deployable-on": ["kubernetes"],
            "media": [
                {
                    "height": None,
                    "type": "icon",
                    "url": (
                        "https://api.charmhub.io/api/v1/media/download/charm_"
                        "zGwm8mNdJ0Tb45JNDYNgiRBRlzaw66oA_icon_ad1a94cf9bb9f6"
                        "8614cb6c17e54e2fbd9dcc7fecc514dc6012b7f58fb5b87f8f"
                        ".png"
                    ),
                    "width": None,
                },
            ],
            "publisher": {
                "display-name": "Canonical",
                "id": "gVVkuxw4C56POG1eszt4RPR3L5Eak8XE",
                "username": "data-platform",
                "validation": "unproven",
            },
            "summary": "Charmed Apache Kafka K8s Operator",
            "title": "Apache Kafka - K8s",
        },
        "type": "charm",
    },
    {
        "default-release": {
            "channel": {
                "base": {
                    "architecture": "amd64",
                    "channel": "22.04",
                    "name": "ubuntu",
                },
                "name": "6/stable",
                "released-at": "2025-08-20T21:22:15.968934+00:00",
                "risk": "stable",
                "track": "6",
            },
            "revision": {"revision": 229},
        },
        "id": "Jfd56ZWJ9IaNHuPjXVLP9d9Xa2XMTSKp",
        "name": "mongodb",
        "result": {
            "categories": [{"featured": False, "name": "databases"}],
            "deployable-on": [],
            "media": [
                {
                    "height": None,
                    "type": "icon",
                    "url": (
                        "https://api.charmhub.io/api/v1/media/download/"
                        "charm_Jfd56ZWJ9IaNHuPjXVLP9d9Xa2XMTSKp_icon_ad"
                        "1a94cf9bb9f68614cb6c17e54e2fbd9dcc7fecc514dc60"
                        "12b7f58fb5b87f8f.png"
                    ),
                    "width": None,
                },
            ],
            "publisher": {
                "display-name": "Canonical",
                "id": "gVVkuxw4C56POG1eszt4RPR3L5Eak8XE",
                "username": "data-platform",
                "validation": "unproven",
            },
            "summary": "A MongoDB operator charm",
            "title": "MongoDB",
        },
        "type": "charm",
    },
]


class TestGetPackages(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch("webapp.store_api.publisher_gateway.find")
    def test_get_packages(self, mock_find):
        mock_find.return_value = {"results": FIND_RESULTS}
        response = self.client.get("/packages.json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("packages", response.json)
        self.assertEqual(len(response.json["packages"]), 3)

    @patch("webapp.store_api.publisher_gateway.find")
    def test_get_packages_with_query(self, mock_find):
        mock_find.return_value = {"results": [FIND_RESULTS[0]]}
        response = self.client.get("/packages.json?q=kafka")
        self.assertEqual(response.status_code, 200)
        self.assertIn("q", response.json)
        self.assertEqual("kafka", response.json["q"])
        self.assertIn("packages", response.json)
        self.assertEqual(len(response.json["packages"]), 1)

    @patch("webapp.store_api.publisher_gateway.find")
    def test_get_packages_with_provides_and_requires(self, mock_find):
        mock_find.return_value = {"results": [FIND_RESULTS[0]]}
        response = self.client.get(
            "/packages.json?provides=kafka-client&requires=certificates"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("provides", response.json)
        self.assertEqual(["kafka-client"], response.json["provides"])
        self.assertIn("requires", response.json)
        self.assertEqual(["certificates"], response.json["requires"])
        self.assertIn("packages", response.json)
        self.assertEqual(len(response.json["packages"]), 1)

    @patch("webapp.store_api.publisher_gateway.find")
    def test_get_packages_error_handling(self, mock_find):
        mock_find.side_effect = Exception("Mocked Error")
        with self.client as client:
            with self.assertRaises(Exception) as context:
                response = client.get("/packages.json")
                self.assertEqual(str(context.exception), "Mocked Error")

                self.assertEqual(response.status_code, 500)

    @patch("webapp.store_api.publisher_gateway.find")
    def test_get_packages_empty_response(self, mock_find):
        mock_find.return_value = {"results": []}
        with self.client as client:
            response = client.get(
                "/packages.json?q=some-random-non-existent-package-name"
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(0, len(response.json["packages"]))
