def get_charm_libraries():
    """
    We don't know yet how the response from the API will be
    """
    with open("webapp/store/data/library_a.py", "r") as library_a_file:
        library_1 = library_a_file.read()

    with open("webapp/store/data/library_b.py", "r") as library_b_file:
        library_2 = library_b_file.read()

    return {
        "charms.apache": [
            {
                "id": "97460193",
                "name": ".v2.http",
                "content": library_1,
                "content_hash": "e0d123e5f316bef78bfdf5a008837577",
                "created_at": "2020-08-04T16:32:00.938000+00:00",
            }
        ],
        "charms.openstack_dashboard": [
            {
                "id": "97460194",
                "name": ".v2.db",
                "content": library_1,
                "content_hash": "e0d123e5f316bef78bfdf5a008837577",
                "created_at": "2020-08-04T16:32:00.938000+00:00",
            },
            {
                "id": "97460194",
                "name": ".v1.dashboard-plugin",
                "content": library_2,
                "content_hash": "e0d123e5f316bef78bfdf5a008837577",
                "created_at": "2020-08-04T16:32:00.938000+00:00",
            },
            {
                "id": "97460194",
                "name": ".v1.nrpe_external_master",
                "content": library_2,
                "content_hash": "e0d123e5f316bef78bfdf5a008837577",
                "created_at": "2020-08-04T16:32:00.938000+00:00",
            },
        ],
        "charms.keystone": [
            {
                "id": "97460195",
                "name": ".v2.websso_trusted",
                "content": library_2,
                "content_hash": "e0d123e5f316bef78bfdf5a008837577",
                "created_at": "2020-08-04T16:32:00.938000+00:00",
            },
        ],
    }
