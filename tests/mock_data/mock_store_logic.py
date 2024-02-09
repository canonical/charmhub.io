from collections import OrderedDict


sample_channel_map = [
    {
        "channel": {
            "base": {
                "architecture": "all",
                "channel": "12.04",
                "name": "ubuntu",
            },
            "name": "latest/stable",
            "released-at": "2021-10-21T16:45:42.323000+00:00",
            "risk": "stable",
            "track": "latest",
        },
        "revision": {
            "bases": [
                {
                    "architecture": "all",
                    "channel": "12.04",
                    "name": "ubuntu",
                },
                {
                    "architecture": "xyz",
                    "channel": "14.04",
                    "name": "ubuntu",
                },
            ],
            "created-at": "2021-10-21",
            "download": {
                "hash-sha-256": "qwerty",
                "url": "some-random-url",
                "size": 1024,
            },
            "revision": 1,
            "version": "1.0",
        },
    },
    {
        "channel": {
            "base": {
                "architecture": "amd",
                "channel": "18.04",
                "name": "ubuntu",
            },
            "name": "channel1/stable",
            "released-at": "2022-10-21T16:45:42.323000+00:00",
            "risk": "stable",
            "track": "channel1",
        },
        "revision": {
            "bases": [
                {
                    "architecture": "amd",
                    "channel": "18.04",
                    "name": "ubuntu",
                },
                {
                    "arhcitecture": "s390",
                    "channel": "20.04",
                    "name": "ubuntu",
                },
                {
                    "architecture": "arm",
                    "channel": "20.04",
                    "name": "ubuntu",
                },
            ],
            "created-at": "2022-10-21",
            "download": {
                "hash-sha-256": "qwerty2",
                "url": "some-random-url2",
                "size": 1024,
            },
            "revision": 2,
            "version": "2.0",
        },
    },
]

converted_sample_channel_map = OrderedDict(
    [
        (
            "latest",
            OrderedDict(
                [
                    (
                        "stable",
                        {
                            "latest": {
                                "architectures": {"all"},
                                "bases": ["Ubuntu 14.04", "Ubuntu 12.04"],
                                "channel": "latest/stable",
                                "channel_bases": [
                                    {
                                        "channels": ["14.04", "12.04"],
                                        "name": "ubuntu",
                                    }
                                ],
                                "released_at": "21 Oct 2021",
                                "revision": {
                                    "bases": [
                                        {
                                            "architecture": "all",
                                            "channel": "12.04",
                                            "name": "ubuntu",
                                        },
                                        {
                                            "architecture": "xyz",
                                            "channel": "14.04",
                                            "name": "ubuntu",
                                        },
                                    ],
                                    "created-at": "2021-10-21",
                                    "download": {
                                        "hash-sha-256": "qwerty",
                                        "size": 1024,
                                        "url": "some-random-url",
                                    },
                                    "revision": 1,
                                    "version": "1.0",
                                },
                                "risk": "stable",
                                "size": 1024,
                                "version": "1.0",
                            },
                            "releases": OrderedDict(
                                [
                                    (
                                        1,
                                        {
                                            "architectures": {"all"},
                                            "bases": [
                                                "Ubuntu 14.04",
                                                "Ubuntu 12.04",
                                            ],
                                            "channel": "latest/stable",
                                            "channel_bases": [
                                                {
                                                    "channels": [
                                                        "14.04",
                                                        "12.04",
                                                    ],
                                                    "name": "ubuntu",
                                                }
                                            ],
                                            "released_at": "21 Oct 2021",
                                            "revision": {
                                                "bases": [
                                                    {
                                                        "architecture": "all",
                                                        "channel": "12.04",
                                                        "name": "ubuntu",
                                                    },
                                                    {
                                                        "architecture": "xyz",
                                                        "channel": "14.04",
                                                        "name": "ubuntu",
                                                    },
                                                ],
                                                "created-at": "2021-10-21",
                                                "download": {
                                                    "hash-sha-256": "qwerty",
                                                    "size": 1024,
                                                    "url": "some-random-url",
                                                },
                                                "revision": 1,
                                                "version": "1.0",
                                            },
                                            "risk": "stable",
                                            "size": 1024,
                                            "version": "1.0",
                                        },
                                    )
                                ]
                            ),
                        },
                    )
                ]
            ),
        ),
        (
            "channel1",
            OrderedDict(
                [
                    (
                        "stable",
                        {
                            "latest": {
                                "architectures": {"amd"},
                                "bases": ["Ubuntu 20.04", "Ubuntu 18.04"],
                                "channel": "channel1/stable",
                                "channel_bases": [
                                    {
                                        "channels": ["20.04", "18.04"],
                                        "name": "ubuntu",
                                    }
                                ],
                                "released_at": "21 Oct 2022",
                                "revision": {
                                    "bases": [
                                        {
                                            "architecture": "amd",
                                            "channel": "18.04",
                                            "name": "ubuntu",
                                        },
                                        {
                                            "arhcitecture": "s390",
                                            "channel": "20.04",
                                            "name": "ubuntu",
                                        },
                                        {
                                            "architecture": "arm",
                                            "channel": "20.04",
                                            "name": "ubuntu",
                                        },
                                    ],
                                    "created-at": "2022-10-21",
                                    "download": {
                                        "hash-sha-256": "qwerty2",
                                        "size": 1024,
                                        "url": "some-random-url2",
                                    },
                                    "revision": 2,
                                    "version": "2.0",
                                },
                                "risk": "stable",
                                "size": 1024,
                                "version": "2.0",
                            },
                            "releases": OrderedDict(
                                [
                                    (
                                        2,
                                        {
                                            "architectures": {"amd"},
                                            "bases": [
                                                "Ubuntu 20.04",
                                                "Ubuntu 18.04",
                                            ],
                                            "channel": "channel1/stable",
                                            "channel_bases": [
                                                {
                                                    "channels": [
                                                        "20.04",
                                                        "18.04",
                                                    ],
                                                    "name": "ubuntu",
                                                },
                                            ],
                                            "released_at": "21 Oct 2022",
                                            "revision": {
                                                "bases": [
                                                    {
                                                        "architecture": "amd",
                                                        "channel": "18.04",
                                                        "name": "ubuntu",
                                                    },
                                                    {
                                                        "arhcitecture": "s390",
                                                        "channel": "20.04",
                                                        "name": "ubuntu",
                                                    },
                                                    {
                                                        "architecture": "arm",
                                                        "channel": "20.04",
                                                        "name": "ubuntu",
                                                    },
                                                ],
                                                "created-at": "2022-10-21",
                                                "download": {
                                                    "hash-sha-256": "qwerty2",
                                                    "size": 1024,
                                                    "url": "some-random-url2",
                                                },
                                                "revision": 2,
                                                "version": "2.0",
                                            },
                                            "risk": "stable",
                                            "size": 1024,
                                            "version": "2.0",
                                        },
                                    )
                                ]
                            ),
                        },
                    )
                ]
            ),
        ),
    ]
)

sample_libraries = {
    "libraries": [
        {
            "library-name": "library1",
            "library-id": "lb1",
            "hash": "123",
            "created-at": "2021-10-21T00:00:00Z",
        },
        {
            "library-name": "library2",
            "library-id": "lb2",
            "hash": "456",
            "created-at": "2021-11-21T00:00:00Z",
        },
        {
            "library-name": "library3",
            "library-id": "lb3",
            "hash": "789",
            "created-at": "2021-12-21T00:00:00Z",
        },
        {
            "library-name": "library4",
            "library-id": "lb4",
            "hash": "101",
            "created-at": "2022-12-21T00:00:00Z",
        },
        {
            "library-name": "library5",
            "library-id": "lb5",
            "hash": "112",
            "created-at": "2023-12-21T00:00:00Z",
        },
    ]
}

sample_processed_libraries = [
    {
        "name": "library1",
        "id": "lb1",
        "hash": "123",
        "created_at": "2021-10-21T00:00:00Z",
    },
    {
        "name": "library2",
        "id": "lb2",
        "hash": "456",
        "created_at": "2021-11-21T00:00:00Z",
    },
    {
        "name": "library3",
        "id": "lb3",
        "hash": "789",
        "created_at": "2021-12-21T00:00:00Z",
    },
    {
        "name": "library4",
        "id": "lb4",
        "hash": "101",
        "created_at": "2022-12-21T00:00:00Z",
    },
    {
        "name": "library5",
        "id": "lb5",
        "hash": "112",
        "created_at": "2023-12-21T00:00:00Z",
    },
]

sample_charm = {
    "default-release": {
        "channel": {
            "base": {
                "architecture": "all",
                "channel": "10.04",
                "name": "ubuntu",
            },
            "name": "stable",
            "released-at": "2021-06-28T14:47:17.575150+00:00",
            "risk": "stable",
            "track": "latest",
        },
        "revision": {"revision": 1},
    },
    "id": "someraondomid",
    "name": "hello-world",
    "result": {
        "categories": [],
        "deployable-on": [],
        "media": [
            {
                "height": None,
                "type": "icon",
                "url": "https://api.charmhub.io/some-random-long-url.png",
                "width": None,
            }
        ],
        "publisher": {"display-name": "Test Publisher"},
        "summary": "A sample charm package.",
        "title": "",
    },
    "type": "charm",
}
