from typing import Dict, List
from webapp.publisher.logic import ReleaseMap, Revision


channel_map_basic = [
    {
        "base": {"architecture": "all", "channel": "14.04", "name": "ubuntu"},
        "channel": "latest/edge",
        "expiration-date": None,
        "progressive": {"paused": None, "percentage": None},
        "resources": [],
        "revision": 5,
        "when": "2021-03-19T03:47:27Z",
    },
    {
        "base": {"architecture": "all", "channel": "14.04", "name": "ubuntu"},
        "channel": "latest/stable",
        "expiration-date": None,
        "progressive": {"paused": None, "percentage": None},
        "resources": [],
        "revision": 5,
        "when": "2021-03-19T03:47:27Z",
    },
]


channels_basic = [
    {
        "branch": None,
        "fallback": None,
        "name": "latest/stable",
        "risk": "stable",
        "track": "latest",
    },
    {
        "branch": None,
        "fallback": "latest/stable",
        "name": "latest/candidate",
        "risk": "candidate",
        "track": "latest",
    },
    {
        "branch": None,
        "fallback": "latest/candidate",
        "name": "latest/beta",
        "risk": "beta",
        "track": "latest",
    },
    {
        "branch": None,
        "fallback": "latest/beta",
        "name": "latest/edge",
        "risk": "edge",
        "track": "latest",
    },
]
revisions_basic: List[Revision] = [
    {
        "bases": [
            {"architecture": "all", "channel": "14.04", "name": "ubuntu"}
        ],
        "created-at": "2015-09-22T12:31:29Z",
        "errors": None,
        "revision": 5,
        "sha3-384": "1234",
        "size": 135247,
        "status": "released",
        "version": "5",
    }
]


expected_result_basic: Dict[str, ReleaseMap] = {
    "latest/stable": {
        "track": "latest",
        "risk": "stable",
        "releases": [
            {
                "revision": {
                    "bases": [
                        {
                            "architecture": "amd64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "arm64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "ppc64el",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "riscv64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "s390x",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                    ],
                    "created-at": "2015-09-22T12:31:29Z",
                    "errors": None,
                    "revision": 5,
                    "sha3-384": "1234",
                    "size": 135247,
                    "status": "released",
                    "version": "5",
                },
                "resources": [],
            }
        ],
    },
    "latest/candidate": {
        "track": "latest",
        "risk": "candidate",
        "releases": [],
    },
    "latest/beta": {"track": "latest", "risk": "beta", "releases": []},
    "latest/edge": {
        "track": "latest",
        "risk": "edge",
        "releases": [
            {
                "revision": {
                    "bases": [
                        {
                            "architecture": "amd64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "arm64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "ppc64el",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "riscv64",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                        {
                            "architecture": "s390x",
                            "channel": "14.04",
                            "name": "ubuntu",
                        },
                    ],
                    "created-at": "2015-09-22T12:31:29Z",
                    "errors": None,
                    "revision": 5,
                    "sha3-384": "1234",
                    "size": 135247,
                    "status": "released",
                    "version": "5",
                },
                "resources": [],
            }
        ],
    },
}

test_case_basic_flow = (
    (channel_map_basic, channels_basic, revisions_basic),
    expected_result_basic,
)
