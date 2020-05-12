# Dummy data for home page
from faker import Faker
from faker.providers import internet
from random import shuffle, choice
import collections.abc


fake = Faker()
fake.add_provider(internet)


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
    {"name": "Bigdata-charmers", "slug": "bigdata-charmers"},
    {"name": "Omnivector", "slug": "omnivector"},
    {"name": "Spicule", "slug": "spicule"},
]

media_url = "https://dashboard.snapcraft.io/site_media/appmedia/"

app_icons = [
    "2018/03/rsz_android_studio_icon.png",
    "2016/09/logo_-_256px.png",
    "2017/06/copy_1.ico.png",
    "2018/11/b8a85a31-MicroK8s_SnapStore_icon.png",
    "2020/02/MANO-Color.png",
    "2018/07/io.snapcraft.Store.png",
]


def get_fake_channel_map_entry(risk, revision):
    return {
        "channel": {
            "name": "latest/" + risk,
            "platform": {
                "os": "ubuntu",
                "series": "bionic",
                "architecture": "all",
            },
            "released-at": "2019-12-16T19:44:44.076943+00:00",
            "risk": risk,
            "track": "latest",
        },
        "revision": {
            "config-yaml": 'one: 1\ntwo: 2\nitems: [1,2,3,4]\n"',
            "created-at": "2019-12-16T19:20:26.673192+00:00",
            "download": {
                "hash-sha-256": "92a8b825ed1108ab64864a7df05eb84ed3925a8d5e"
                "4741169185f77cef9b52517ad4b79396bab43b19e544a908ec83c4",
                "size": 12042240,
                "url": "https://api.snapcraft.io/api/v1/snaps/download/"
                "QLLfVfIKfcnTZiPFnmGcigB2vB605ZY7_16.snap",
            },
            "metadata-yaml": "name: myname\n"
            "version: 1.0.3\n"
            "summary: A charm or bundle.\n"
            "description: |\n"
            "  This will install and setup services "
            "optimized to run in the cloud.\n"
            "  By default it will place Ngnix configured "
            "to scale horizontally\n"
            "  with Nginx's reverse proxy.\n",
            "platforms": [
                {"os": "ubuntu", "series": "18.04 LTS", "architecture": "all"},
                {"os": "ubuntu", "series": "14.04 LTS", "architecture": "all"},
            ],
            "revision": revision,
            "version": "1.0.3",
        },
    }


def get_fake_charm():
    return {
        "type": "charm",
        "id": "charmCHARMcharmCHARMcharmCHARM" + str(fake.random_int(10, 99)),
        "name": fake.domain_word(),
        "charm": {
            "categories": [
                {"name": "blog", "featured": True},
                {"name": "applications", "featured": False},
            ],
            "description": fake.text(),
            "license": "Apache-2.0",
            "media": [
                {
                    "type": "icon",
                    "url": f"{media_url}{choice(app_icons)}",
                    "height": 256,
                    "width": 256,
                },
            ],
            "publisher": {"display-name": choice(mock_publisher_list)["name"]},
            "summary": fake.text(),
            "used-by": [
                "wordpress-everlast",
                "wordpress-jorge",
                "wordpress-site",
            ],
        },
        "channel-map": [
            get_fake_channel_map_entry("stable", 16),
            get_fake_channel_map_entry("candidate", 16),
            get_fake_channel_map_entry("beta", 16),
            get_fake_channel_map_entry("edge", 16),
        ],
        "revision": get_fake_channel_map_entry("stable", 16),
        # Added from us:
        "supported_os_list": ["18.04 LTS", "19.10"],
        "overview": "<h4>Full feature web interface for interacting with "
        "instances, images, volumes and networks.</h4>"
        "<p>Kubernetes is an open-source platform for deploying, scaling,"
        "and operations of application containers across a cluster of "
        "hosts. Kubernetes is portable in that it works with public, "
        "private, and hybrid clouds. Extensible through a pluggable "
        "infrastructure. Self healing in that it will automatically "
        "restart and place containers on healthy nodes if a node ever "
        "goes away.</p>"
        "<h4>Usage</h4>"
        "<p>The OpenStack Dashboard is deployed and related to keystone:</p>"
        "<pre><code>juju deploy openstack-dashboard"
        "juju add-relation openstack-dashboard keystone</code></pre>"
        "<p>The dashboard will use keystone for user authentication and"
        "authorization and to interact with the catalog of services "
        "within the cloud.</p>"
        "<p>The dashboard is accessible on:</p>"
        "<pre><code>http(s)://service_unit_address/horizon</code></pre>"
        "<p>At a minimum, the cloud must provide Glance and Nova services."
        "</p>",
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
        "actions": [
            {
                "name": "pause",
                "hint": "Pause the unit",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "type": "string",
                        "description": "The pool to set this variable on",
                    },
                    {
                        "name": "Key",
                        "type": "string",
                        "description": "Any valid Ceph key from http://docs"
                        ".ceph.com/docs/master/rados/operations/pools"
                        "/#set-pool-values",
                    },
                    {
                        "name": "Value",
                        "type": "string",
                        "description": "The value to set",
                    },
                ],
                "required": ["key", "value", "pool-name"],
            },
            {
                "name": "resume",
                "hint": "Resume the unit",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "type": "string",
                        "description": "The pool to set this variable on",
                    },
                    {
                        "name": "Key",
                        "type": "string",
                        "description": "Any valid Ceph key from "
                        "http://docs.ceph.com/docs/master/rados/"
                        "operations/pools/#set-pool-values",
                    },
                    {
                        "name": "Value",
                        "type": "string",
                        "description": "The value to set",
                    },
                ],
                "required": ["key", "value", "pool-name"],
            },
            {
                "name": "upgrade",
                "hint": "Perform an upgrade",
                "description": "Set a value for the pool",
                "params": [
                    {
                        "name": "pool-name",
                        "type": "string",
                        "description": "The pool to set this variable on",
                    },
                    {
                        "name": "Key",
                        "type": "string",
                        "description": "Any valid Ceph key from "
                        "http://docs.ceph.com/docs/master/rados/operations/"
                        "pools/#set-pool-values",
                    },
                    {
                        "name": "Value",
                        "type": "string",
                        "description": "The value to set",
                    },
                ],
                "required": ["key", "value", "pool-name"],
            },
        ],
        "docs": [
            {
                "name": "Deploying",
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
                "name": "Network-Restricted Environments",
                "description": "<p>Setting this to True will allow password"
                " form autocompletion by browser.</p>\n<p>Value type: String"
                "</p>\n<p>Default value: None</p>",
            },
            {
                "name": "Status",
                "description": "<p>The maximum number of objects (e.g."
                " Swift objects or Glance images) to display on a single"
                ' page before providing a paging element (a "more" link) to'
                " paginate results.</p>\n<p>Value type: Interval</p>\n<p>"
                "Default value: None</p>",
            },
            {
                "name": "Smoke test",
                "description": "<p>Enable cinder backup panel.</p>\n<p>Value"
                " type: Boolean</p>\n<p>Default value: None</p>",
            },
            {
                "name": "Utilities",
                "description": "<p>Use a custom theme supplied as a resource."
                " NOTE: This setting is supported OpenStack Mitaka and"
                " this setting is mutually exclustive to ubuntu-theme and"
                " default-theme.</p>\n<p>Value type: Boolean</p>\n<p>Default"
                " value: None</p>",
            },
            {
                "name": "Monitoring",
                "description": "<p>This option provides a means to enable"
                " customisation modules to modify existing dashboards and"
                " panels. This is available from Liberty onwards.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: None</p>",
            },
            {
                "name": "Logging",
                "description": "<p>Database name for Horizon (if enabled)."
                "</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "Benchmarking",
                "description": "<p>Username for Horizon database access (if"
                " enabled).</p>\n<p>Value type: String</p>\n<p>Default value:"
                " Horizon</p>",
            },
            {
                "name": "Scaling",
                "description": "<p>Enable Django debug messages.</p>\n<p>"
                "Value type: String</p>\n<p>Default value: No</p>",
            },
        ],
        "integrations": [
            {
                "name": "certificates: tls-certificates",
                "software": [
                    {
                        "icon": "https://api.jujucharms.com/charmstore/v5/"
                        "vault-37/icon.svg",
                        "name": "vault",
                    },
                    {
                        "icon": "https://api.jujucharms.com/charmstore/v5/"
                        "~yellow/easyrsa-0/icon.svg",
                        "name": "Easyrsa",
                    },
                ],
            },
            {
                "name": "ha: hacluster",
                "software": [
                    {
                        "icon": "https://api.jujucharms.com/charmstore/"
                        "v5/hacluster-66/icon.svg",
                        "name": "Hacluster",
                    }
                ],
            },
        ],
    }


def get_fake_bundle():
    return {
        "type": "bundle",
        "id": "bundleBUNDLEbundleBUNDLEbundle" + str(fake.random_int(10, 99)),
        "name": fake.domain_word(),
        "bundle": {
            "categories": [{"name": "networking", "featured": False}],
            "description": fake.text(),
            "license": "LGPL-2.1+",
            "media": [
                {
                    "type": "icon",
                    "url": f"{media_url}{choice(app_icons)}",
                    "height": 125,
                    "width": 125,
                },
                {
                    "type": "bundle-components",
                    "url": "https://api.jujucharms.com/charmstore/v5/bundle/"
                    "osm-40/diagram.svg",
                },
            ],
            "summary": fake.text(),
            "publisher": {"display-name": choice(mock_publisher_list)["name"]},
        },
        "channel-map": [
            get_fake_channel_map_entry("stable", 61),
            get_fake_channel_map_entry("candidate", 61),
            get_fake_channel_map_entry("beta", 61),
            get_fake_channel_map_entry("edge", 61),
        ],
        "revision": get_fake_channel_map_entry("stable", 61),
        # Added from us:
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
    }


def gen_mock_data(merge_with=[]):
    bundles = [get_fake_bundle() for i in range(fake.random_int(5, 15))]
    charms = [get_fake_charm() for i in range(fake.random_int(5, 15))]
    list_data = bundles + charms
    shuffle(list_data)
    return list_data


def mock_missing_properties(package):
    def update(d, u):
        for k, v in u.items():
            if isinstance(v, collections.abc.Mapping):
                d[k] = update(d.get(k, {}), v)
            else:
                d[k] = v
        return d

    if package["type"] == "charm":
        fake_package = get_fake_charm()
    else:
        fake_package = get_fake_bundle()

    return update(fake_package, package)
