wordpress_charm = {
    "channel-map": [
        {
            "channel": {
                "name": "latest/stable",
                "platform": {
                    "architecture": "all",
                    "os": "ubuntu",
                    "series": "bionic",
                },
                "released-at": "2019-12-16T19:44:44.076943+00:00",
                "risk": "stable",
                "track": "latest",
            },
            "revision": {
                "config-yaml": "one: 1\ntwo: 2\nitems: [1,2,3,4]\n",
                "created-at": "2019-12-16T19:20:26.673192+00:00",
                "download": {
                    "hash-sha-256": "fake-data",
                    "size": 12042240,
                    "url": "https://fake-data",
                },
                "metadata-yaml": "data",
                "platforms": [
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "bionic",
                    },
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "trusty",
                    },
                ],
                "revision": 16,
                "version": "1.0.3",
            },
        },
        {
            "channel": {
                "name": "latest/candidate",
                "platform": {
                    "architecture": "all",
                    "os": "ubuntu",
                    "series": "bionic",
                },
                "released-at": "2019-12-16T19:44:44.076943+00:00",
                "risk": "candidate",
                "track": "latest",
            },
            "revision": {
                "config-yaml": "one: 1\ntwo: 2\nitems: [1,2,3,4]\n",
                "created-at": "2019-12-16T19:20:26.673192+00:00",
                "download": {
                    "hash-sha-256": "fake-data",
                    "size": 12042240,
                    "url": "https://fake-data",
                },
                "metadata-yaml": "fake-data",
                "platforms": [
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "bionic",
                    },
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "trusty",
                    },
                ],
                "revision": 16,
                "version": "1.0.3",
            },
        },
        {
            "channel": {
                "name": "latest/beta",
                "platform": {
                    "architecture": "all",
                    "os": "ubuntu",
                    "series": "bionic",
                },
                "released-at": "2019-12-16T19:44:44.076943+00:00",
                "risk": "beta",
                "track": "latest",
            },
            "revision": {
                "config-yaml": "one: 1\ntwo: 2\nitems: [1,2,3,4]\n",
                "created-at": "2019-12-16T19:20:26.673192+00:00",
                "download": {
                    "hash-sha-256": "fake-data",
                    "size": 12042240,
                    "url": "fake-data",
                },
                "metadata-yaml": "fake-data",
                "platforms": [
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "bionic",
                    },
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "trusty",
                    },
                ],
                "revision": 16,
                "version": "1.0.3",
            },
        },
        {
            "channel": {
                "name": "latest/edge",
                "platform": {
                    "architecture": "all",
                    "os": "ubuntu",
                    "series": "bionic",
                },
                "released-at": "2019-12-16T19:44:44.076943+00:00",
                "risk": "edge",
                "track": "latest",
            },
            "revision": {
                "config-yaml": "one: 1\ntwo: 2\nitems: [1,2,3,4]\n",
                "created-at": "2019-12-16T19:20:26.673192+00:00",
                "download": {
                    "hash-sha-256": "fake-data",
                    "size": 12042240,
                    "url": "https://fake-data",
                },
                "metadata-yaml": "fake-data",
                "platforms": [
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "bionic",
                    },
                    {
                        "architecture": "all",
                        "os": "ubuntu",
                        "series": "trusty",
                    },
                ],
                "revision": 16,
                "version": "1.0.3",
            },
        },
    ],
    "result": {
        "categories": [
            {"featured": True, "name": "blog"},
            {"featured": False, "name": "applications"},
        ],
        "description": "fake-data",
        "license": "Apache-2.0",
        "media": [
            {
                "height": 256,
                "type": "icon",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2017/04/wpcom.png",
                "width": 256,
            }
        ],
        "publisher": {"display-name": "Wordress Charmers"},
        "summary": "fake-data",
        "used-by": [
            "wordpress-everlast",
            "wordpress-jorge",
            "wordpress-site",
        ],
    },
    "default-release": {
        "channel": {
            "name": "latest/stable",
            "platform": {
                "architecture": "all",
                "os": "ubuntu",
                "series": "bionic",
            },
            "released-at": "2019-12-16T19:44:44.076943+00:00",
            "risk": "stable",
            "track": "latest",
        },
        "revision": {
            "config-yaml": "one: 1\ntwo: 2\nitems: [1,2,3,4]\n",
            "created-at": "2019-12-16T19:20:26.673192+00:00",
            "download": {
                "hash-sha-256": "fake-data",
                "size": 12042240,
                "url": "https://fake-data",
            },
            "metadata-yaml": "fake-data",
            "platforms": [
                {"architecture": "all", "os": "ubuntu", "series": "bionic"},
                {"architecture": "all", "os": "ubuntu", "series": "trusty"},
            ],
            "revision": 16,
            "version": "1.0.3",
        },
    },
    "id": "charmCHARMcharmCHARMcharmCHARM01",
    "name": "wordpress",
    "type": "charm",
}
