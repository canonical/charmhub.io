sample_packages_api_response = {
    "results": [
        {"name": "testing1", "type": "charm", "other_field": "value1"},
        {"name": "testing2", "type": "bundle", "other_field": "value2"},
        {"name": "testing3", "type": "charm", "other_field": "value1"},
        {"name": "testing4", "type": "bundle", "other_field": "value2"},
        {"name": "testing5", "type": "charm", "other_field": "value2"},
        {"name": "testing6", "type": "charm", "other_field": "value1"},
        {"name": "testing7", "type": "bundle", "other_field": "value2"},
        {"name": "testing8", "type": "charm", "other_field": "value1"},
        {"name": "testing9", "type": "bundle", "other_field": "value2"},
        {"name": "testing10", "type": "charm", "other_field": "value2"},
    ]
}

sample_charms = {
    "charms": [
        {"name": "testing1", "type": "charm", "other_field": "value1"},
        {"name": "testing3", "type": "charm", "other_field": "value1"},
        {"name": "testing5", "type": "charm", "other_field": "value2"},
        {"name": "testing6", "type": "charm", "other_field": "value1"},
        {"name": "testing8", "type": "charm", "other_field": "value1"},
    ]
}

sample_bundles = {
    "bundles": [
        {"name": "testing2", "type": "bundle", "other_field": "value2"},
        {"name": "testing4", "type": "bundle", "other_field": "value2"},
        {"name": "testing7", "type": "bundle", "other_field": "value2"},
        {"name": "testing9", "type": "bundle", "other_field": "value2"},
        {"name": "testing10", "type": "bundle", "other_field": "value2"},
    ]
}

sample_docs = {
    "docs": [
        {
            "blocks": [
                {
                    "content": "Source: https://github.com/juju/juju",
                    "highlights": {
                        "content": [
                            "util functions designed to help in creating"
                        ],
                        "title": ["<span>Test</span> includes"],
                    },
                    "id": "test-includes",
                    "title": "Test includes",
                    "type": "section",
                }
            ],
            "domain": "https://canonical-juju.readthedocs-hosted.com",
            "highlights": {"title": ["<span>Test</span> includes"]},
            "path": "/en/3.6/contributor/reference/testing/integration",
            "project": {"alias": None, "slug": "canonical-juju"},
            "title": "Test includes",
            "type": "page",
            "version": {"slug": "3.6"},
        },
        {
            "blocks": [
                {
                    "content": "Source: https://github.com/juju/juju",
                    "highlights": {
                        "content": [
                            "Integration <span>test</span> suites are often "
                        ],
                        "title": ["Integration <span>test</span> suite"],
                    },
                    "id": "integration-test-suite",
                    "title": "Integration test suite",
                    "type": "section",
                }
            ],
            "domain": "https://canonical-juju.readthedocs-hosted.com",
            "highlights": {"title": ["Integration <span>test</span> suite"]},
            "path": "/en/3.6/contributor/reference/testing/",
            "project": {"alias": None, "slug": "canonical-juju"},
            "title": "Integration test suite",
            "type": "page",
            "version": {"slug": "3.6"},
        },
    ]
}

sample_topics = {
    "topics": [
        {
            "category_id": 33,
            "excerpt": "The expander below has instructions>",
            "fancy_title": "Roadmap &amp; Releases",
            "id": 5064,
            "slug": "roadmap-releases",
            "tags": ["news"],
            "title": "Roadmap & Releases",
        },
        {
            "category_id": 6,
            "fancy_title": "Juju 2.9.0 Release Notes",
            "id": 4525,
            "slug": "juju-2-9-0-release-notes",
            "tags": ["news"],
            "title": "Juju 2.9.0 Release Notes",
        },
        {
            "category_id": 6,
            "fancy_title": "ceph-radosgw unit stuck in blocked state",
            "id": 3357,
            "slug": "ceph-radosgw-unit-stuck-in-blocked-state",
            "tags": [],
            "title": "ceph-radosgw unit stuck in blocked state",
        },
        {
            "category_id": 6,
            "fancy_title": "Juju units;",
            "id": 6693,
            "slug": "juju-units-die-with",
            "tags": ["question"],
            "title": "Juju units die",
        },
        {
            "category_id": 41,
            "fancy_title": "Mysql-innodb-cluster",
            "id": 4803,
            "slug": "mysql-innodb-cluster-cluster-not-yet-created-by-leader",
            "tags": [],
            "title": "Mysql-innodb-cluster",
        },
    ]
}
