class Config:
    def __init__(self, d):
        self.__dict__ = d


config = Config(
    {
        "app_name": "charmhub.io",
        "details_regex": "[a-z0-9-]*[a-z][a-z0-9-]*",
        "details_regex_uppercase": "[A-Za-z0-9-]*[A-Za-z][A-Za-z0-9-]*",
    }
)


# Dummy data for home page
mock_search_results = [
    {
        "developer_validation": "unproven",
        "entity_type": "bundle",
        "icon_url": "https://dashboard.snapcraft.io/site_media/appmedia/"
        "2016/09/logo_-_256px.png",
        "media": [
            {
                "type": "icon",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2016/09/logo_-_256px.png",
            },
            {
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2016/09/"
                "Electrum_2.6.4__-__default_wallet_018.png",
            },
        ],
        "origin": "antonwilc0x",
        "package_name": "electrum",
        "type": "bundle",
        "publisher": "Tomas CaseyWilcox",
        "sections": [{"featured": True, "name": "finance"}],
        "summary": "Lightweight Bitcoin Client",
        "title": "electrum",
    },
    {
        "developer_validation": "verified",
        "entity_type": "charm",
        "icon_url": "https://dashboard.snapcraft.io/site_media/"
        "appmedia/2017/06/copy_1.ico.png",
        "media": [
            {
                "type": "icon",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2017/06/copy_1.ico.png",
            },
            {
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2017/06/"
                "Screen_Shot_2017-06-07_at_8.16.09_AM.png",
            },
        ],
        "origin": "aws",
        "package_name": "aws-cli",
        "type": "charm",
        "publisher": "Amazon Web Services",
        "sections": [{"featured": True, "name": "server-and-cloud"}],
        "summary": "Universal Command Line Interface for"
        " Amazon Web Services",
        "title": "aws-cli",
    },
    {
        "developer_validation": "unproven",
        "entity_type": "charm",
        "icon_url": "https://dashboard.snapcraft.io/site_media/appmedia"
        "/2018/03/rsz_android_studio_icon.png",
        "media": [
            {
                "type": "icon",
                "url": "https://dashboard.snapcraft.io/site_media"
                "/appmedia/2018/03/rsz_android_studio_icon.png",
            },
            {
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media"
                "/appmedia/2018/03/android-studio.png",
            },
            {
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media"
                "/appmedia/2019/04/Screenshot_20190418_002828.png",
            },
        ],
        "origin": "snapcrafters",
        "package_name": "android-studio",
        "publisher": "Snapcrafters",
        "sections": [{"featured": True, "name": "development"}],
        "summary": "The IDE for Android",
        "title": "Android Studio",
    },
]

mock_categories = [
    {"name": "Analytics", "slug": "analytics"},
    {"name": "App-servers", "slug": "app-servers"},
    {"name": "Big-data", "slug": "big-data"},
    {"name": "Containers", "slug": "containers"},
    {"name": "Databases", "slug": "databases"},
    {"name": "Keystone", "slug": "keystone"},
    {"name": "Kubernetes", "slug": "kubernetes"},
    {"name": "Identity", "slug": "identity"},
    {"name": "Monitoring", "slug": "monitoring"},
    {"name": "Network", "slug": "network"},
    {"name": "Openstack", "slug": "openstack"},
    {"name": "Operations", "slug": "operations"},
    {"name": "Performance", "slug": "performance"},
    {"name": "Security", "slug": "security"},
    {"name": "System", "slug": "system"},
    {"name": "Storage", "slug": "storage"},
]

mock_publisher_list = [
    {"name": "Charmers", "slug": "charmers"},
    {"name": "Containers", "slug": "containers"},
    {"name": "Bigdata-charmers", "slug": "bigdata-charmers"},
    {"name": "Omnivector", "slug": "omnivector"},
    {"name": "Spicule", "slug": "spicule"},
]


# Dummy data for details page
mock_entities = [
    {
        "entity-id": "RT9mcUhVsRYrDLG8qnvGiy26NKvv6Qkd",
        "entity_type": "bundle",
        "entity_title": "VLC",
        "package_name": "vlc",
        "categories": [{"slug": "photo-and-video", "name": "Photo and Video"}],
        "version": "3.0.8",
        "license": "GPL-2.0+",
        "repository_url": "https://github.com/openstack-charmers/"
        "openstack-bundles",
        "publisher": "VideoLAN",
        "username": "videolan",
        "screenshots": [
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2016/07/vlc-2.0-poney.jpg",
                "width": "None",
            },
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2018/04/"
                "2018-04-26-161203_1126x899_scrot_yBFL55L.png",
                "width": "None",
            },
        ],
        "videos": [],
        "prices": {},
        "configuration": [
            {
                "name": "action-managed-upgrade",
                "description": "<p>If True enables openstack upgrades for"
                " this charm via juju actions. You will still need to set"
                " openstack-origin to the new repository but instead of an"
                " upgrade running automatically across all units, it will"
                " wait for you to execute the openstack-upgrade action for"
                " this charm on each unit. If False it will revert to"
                " existing behavior of upgrading all units on config"
                " change.</p>\n<p>Value type: String</p>\n<p>Default"
                " value: None</p>",
            },
            {
                "name": "allow-password-autocompletion",
                "description": "<p>Setting this to True will allow password"
                " form autocompletion by browser.</p>\n<p>Value type: String"
                "</p>\n<p>Default value: None</p>",
            },
            {
                "name": "api-result-limit",
                "description": "<p>The maximum number of objects (e.g."
                " Swift objects or Glance images) to display on a single"
                ' page before providing a paging element (a "more" link) to'
                " paginate results.</p>\n<p>Value type: Interval</p>\n<p>"
                "Default value: None</p>",
            },
            {
                "name": "cinder-backup",
                "description": "<p>Enable cinder backup panel.</p>\n<p>Value"
                " type: Boolean</p>\n<p>Default value: None</p>",
            },
            {
                "name": "custom-theme",
                "description": "<p>Use a custom theme supplied as a resource."
                " NOTE: This setting is supported OpenStack Mitaka and"
                " this setting is mutually exclustive to ubuntu-theme and"
                " default-theme.</p>\n<p>Value type: Boolean</p>\n<p>Default"
                " value: None</p>",
            },
            {
                "name": "customization-module",
                "description": "<p>This option provides a means to enable"
                " customisation modules to modify existing dashboards and"
                " panels. This is available from Liberty onwards.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: None</p>",
            },
            {
                "name": "database",
                "description": "<p>Database name for Horizon (if enabled)."
                "</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "database-user",
                "description": "<p>Username for Horizon database access (if"
                " enabled).</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "debug",
                "description": "<p>Enable Django debug messages.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: No</p>",
            },
        ],
        "contact": "https://www.videolan.org/support/",
        "website": "https://www.videolan.org/vlc/",
        "summary": "The ultimate media player",
        "description": "<p>VLC is the VideoLAN project's media player.</p>"
        "\n<p>Completely open source and privacy-friendly, it plays every "
        "multimedia file and streams.</p>\n<p>It notably plays MKV, MP4, "
        "MPEG, MPEG-2, MPEG-4, DivX, MOV, WMV, QuickTime, WebM, FLAC,"
        " MP3, Ogg/Vorbis files, BluRays, DVDs, VCDs, podcasts, and "
        "multimedia streams from various network sources. It supports "
        "subtitles, closed captions and is translated in numerous "
        "languages.</p>\n",
        "channel_map": {
            "amd64": {
                "latest": [
                    {
                        "created": "2019/7/4",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.8",
                        "jdk": "12",
                        "imagery": "13",
                        "translations": "7",
                    },
                    {
                        "created": "22019/6/12",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.7",
                        "jdk": "12",
                        "imagery": "11",
                        "translations": "6",
                    },
                    {
                        "created": "22019/4/3",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.7",
                        "jdk": "13",
                        "imagery": "13",
                        "translations": "6",
                    },
                ]
            }
        },
        "bundle_content": [
            {
                "icon_url": "https://api.jujucharms.com/charmstore/v5/"
                "openstack-dashboard-271/icon.svg"
            },
            {
                "icon_url": "https://api.jujucharms.com/charmstore/v5/"
                "lxd-22/icon.svg"
            },
            {
                "icon_url": "https://api.jujucharms.com/charmstore/v5/"
                "ceph/icon.svg"
            },
            {
                "icon_url": "https://api.jujucharms.com/charmstore/v5/"
                "ceph/icon.svg"
            },
            {
                "icon_url": "https://api.jujucharms.com/charmstore/v5/"
                "lxd-22/icon.svg"
            },
        ],
        "supported_os_list": ["18.04 LTS", "19.10"],
        "deployments": "6021",
        "has_stable": True,
        "developer_validation": "verified",
        "default_track": "latest",
        "lowest_risk_available": "stable",
        "confinement": "strict",
        "trending": False,
        "filesize": "212.8 MB",
        "last_updated": "16 December 2019",
        "last_updated_raw": "2019-12-16T21:50:10.209544+00:00",
        "is_users_snap": False,
        "unlisted": False,
    },
    {
        "entity-id": "RT9mcUhVsRYrDLG8qnvGiy26NKvv6Qkd",
        "entity_type": "charm",
        "entity_title": "VLC",
        "package_name": "vlc",
        "categories": [{"slug": "photo-and-video", "name": "Photo and Video"}],
        "icon_url": "https://dashboard.snapcraft.io/site_media/"
        "appmedia/2016/07/vlc.png",
        "repository_url": "https://github.com/openstack/charm-neutron-api",
        "version": "3.0.8",
        "license": "GPL-2.0+",
        "publisher": "VideoLAN",
        "username": "videolan",
        "screenshots": [
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2016/07/vlc-2.0-poney.jpg",
                "width": "None",
            },
            {
                "height": "None",
                "type": "screenshot",
                "url": "https://dashboard.snapcraft.io/site_media/"
                "appmedia/2018/04/"
                "2018-04-26-161203_1126x899_scrot_yBFL55L.png",
                "width": "None",
            },
        ],
        "videos": [],
        "prices": {},
        "configuration": [
            {
                "name": "action-managed-upgrade",
                "description": "<p>If True enables openstack upgrades for"
                " this charm via juju actions. You will still need to set"
                " openstack-origin to the new repository but instead of an"
                " upgrade running automatically across all units, it will"
                " wait for you to execute the openstack-upgrade action for"
                " this charm on each unit. If False it will revert to"
                " existing behavior of upgrading all units on config"
                " change.</p>\n<p>Value type: String</p>\n<p>Default"
                " value: None</p>",
            },
            {
                "name": "allow-password-autocompletion",
                "description": "<p>Setting this to True will allow password"
                " form autocompletion by browser.</p>\n<p>Value type: String"
                "</p>\n<p>Default value: None</p>",
            },
            {
                "name": "api-result-limit",
                "description": "<p>The maximum number of objects (e.g."
                " Swift objects or Glance images) to display on a single"
                ' page before providing a paging element (a "more" link) to'
                " paginate results.</p>\n<p>Value type: Interval</p>\n<p>"
                "Default value: None</p>",
            },
            {
                "name": "cinder-backup",
                "description": "<p>Enable cinder backup panel.</p>\n<p>Value"
                " type: Boolean</p>\n<p>Default value: None</p>",
            },
            {
                "name": "custom-theme",
                "description": "<p>Use a custom theme supplied as a resource."
                " NOTE: This setting is supported OpenStack Mitaka and"
                " this setting is mutually exclustive to ubuntu-theme and"
                " default-theme.</p>\n<p>Value type: Boolean</p>\n<p>Default"
                " value: None</p>",
            },
            {
                "name": "customization-module",
                "description": "<p>This option provides a means to enable"
                " customisation modules to modify existing dashboards and"
                " panels. This is available from Liberty onwards.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: None</p>",
            },
            {
                "name": "database",
                "description": "<p>Database name for Horizon (if enabled)."
                "</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "database-user",
                "description": "<p>Username for Horizon database access (if"
                " enabled).</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "debug",
                "description": "<p>Enable Django debug messages.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: No</p>",
            },
        ],
        "contact": "https://www.videolan.org/support/",
        "website": "https://www.videolan.org/vlc/",
        "summary": "The ultimate media player",
        "description": "<p>VLC is the VideoLAN project's media player.</p>"
        "\n<p>Completely open source and privacy-friendly, it plays every "
        "multimedia file and streams.</p>\n<p>It notably plays MKV, MP4, "
        "MPEG, MPEG-2, MPEG-4, DivX, MOV, WMV, QuickTime, WebM, FLAC,"
        " MP3, Ogg/Vorbis files, BluRays, DVDs, VCDs, podcasts, and "
        "multimedia streams from various network sources. It supports "
        "subtitles, closed captions and is translated in numerous "
        "languages.</p>\n",
        "integrations": [
            {
                "category": "certificates: tls-certificates",
                "software": [
                    {
                        "name": "Vault",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                    {
                        "name": "Easyrsa",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                ],
            },
            {
                "category": "ha: hacluster",
                "software": [
                    {
                        "name": "Hacluster",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                ],
            },
            {
                "category": "identity-service: keystone",
                "software": [
                    {
                        "name": "Keystone",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                    {
                        "name": "Keystone K8s",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                    {
                        "name": "Contrail Openstack",
                        "icon_url": "https://assets.ubuntu.com/v1/425efe3a-"
                        "lxd.svg",
                    },
                ],
            },
        ],
        "actions": [
            {
                "name": "pause",
                "hint": "Pause the openstack-dashboard unit",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "content": {
                            "type": "string",
                            "description": "The pool to set this variable on.",
                        },
                    },
                ],
            },
            {
                "name": "resume",
                "hint": "Resume the openstack-dashboard unit",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "content": {
                            "type": "string",
                            "description": "The pool to set this variable on.",
                        },
                    },
                ],
            },
            {
                "name": "openstack-upgrade",
                "hint": "",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "content": {
                            "type": "string",
                            "description": "The pool to set this variable on.",
                        },
                    },
                    {
                        "name": "Key",
                        "content": {
                            "type": "string",
                            "description": "Any valid Ceph key from http://"
                            "docs.ceph.com/docs/master/rados/operations/"
                            "pools/#set-pool-values",
                        },
                    },
                    {
                        "name": "Value",
                        "content": {
                            "type": "string",
                            "description": "The value to set",
                        },
                    },
                ],
                "required": "[key, value, pool-name]",
                "additionalProperties": "False",
            },
            {
                "name": "security-checklist",
                "hint": "Validate the running configuration against the"
                " OpenStack security guides checklist.",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "content": {
                            "type": "string",
                            "description": "The pool to set this variable on.",
                        },
                    },
                ],
            },
        ],
        "channel_map": {
            "amd64": {
                "latest": [
                    {
                        "created": "2019/7/4",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.8",
                        "jdk": "12",
                        "imagery": "13",
                        "translations": "7",
                    },
                    {
                        "created": "22019/6/12",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.7",
                        "jdk": "12",
                        "imagery": "11",
                        "translations": "6",
                    },
                    {
                        "created": "22019/4/3",
                        "channel": "stable",
                        "risk": "stable",
                        "charm": "1.7",
                        "jdk": "13",
                        "imagery": "13",
                        "translations": "6",
                    },
                ]
            }
        },
        "supported_os_list": ["14.04 LTS", "18.04 LTS", "19.04", "19.10"],
        "deployments": "6021",
        "has_stable": True,
        "developer_validation": "verified",
        "default_track": "latest",
        "lowest_risk_available": "stable",
        "confinement": "strict",
        "trending": False,
        "filesize": "212.8 MB",
        "last_updated": "16 December 2019",
        "last_updated_raw": "2019-12-16T21:50:10.209544+00:00",
        "is_users_snap": False,
        "unlisted": False,
    },
]
