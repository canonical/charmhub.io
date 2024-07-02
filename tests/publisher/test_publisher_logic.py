from unittest import TestCase
from webapp.publisher.logic import process_releases
from tests.mock_data.mock_publisher_logic import test_case_basic_flow


class TestProcessReleases(TestCase):
    def setUp(self):
        self.mock_channels = [
            {"name": "latest/stable", "track": "latest", "risk": "stable"},
            {"name": "latest/edge", "track": "latest", "risk": "edge"},
        ]
        self.mock_revisions = [
            {
                "revision": 1,
                "bases": [
                    {
                        "architecture": "amd64",
                        "channel": "latest/stable",
                        "name": "app",
                    }
                ],
                "created-at": "2021-01-01T00:00:00Z",
                "sha3-384": "dummyhash1",
                "size": 123456,
                "status": "released",
                "version": "1.0.0",
                "errors": None,
            },
            {
                "revision": 2,
                "bases": [
                    {
                        "architecture": "amd64",
                        "channel": "latest/edge",
                        "name": "app",
                    }
                ],
                "created-at": "2021-01-02T00:00:00Z",
                "sha3-384": "dummyhash2",
                "size": 654321,
                "status": "released",
                "version": "2.0.0-beta",
                "errors": None,
            },
        ]
        self.mock_channel_map = [
            {"channel": "latest/stable", "revision": 1, "resources": []},
            {"channel": "latest/edge", "revision": 2, "resources": []},
        ]

    def test_process_releases_empty_inputs(self):
        result = process_releases([], [], [])
        self.assertEqual(result, {})

    def test_process_releases_single_channel_single_revision(self):
        expected_output = {
            "latest/stable": {
                "track": "latest",
                "risk": "stable",
                "releases": [
                    {"revision": self.mock_revisions[0], "resources": []}
                ],
            }
        }
        result = process_releases(
            self.mock_channel_map[:1],
            self.mock_channels[:1],
            self.mock_revisions[:1],
        )
        self.assertEqual(result, expected_output)

    def test_process_releases_multiple_channels_revisions(
        self,
    ):
        expected_output = {
            "latest/stable": {
                "track": "latest",
                "risk": "stable",
                "releases": [
                    {"revision": self.mock_revisions[0], "resources": []}
                ],
            },
            "latest/edge": {
                "track": "latest",
                "risk": "edge",
                "releases": [
                    {"revision": self.mock_revisions[1], "resources": []}
                ],
            },
        }
        result = process_releases(
            self.mock_channel_map, self.mock_channels, self.mock_revisions
        )
        self.assertEqual(result, expected_output)

    def test_process_releases_basic_flow(
        self,
    ):
        params, expected_output = test_case_basic_flow
        result = process_releases(*params)
        self.assertEqual(result, expected_output)
