mocked_actions = {
    "replication-pause": {
        "description": "Pause replication replay on a hot standby unit."
    },
    "replication-resume": {
        "description": "Resume replication replay on a hot standby unit."
    },
    "switchover": {
        "description": "Promote a specific unit to master. Must be run on the "
        "leader unit.\n",
        "params": {
            "master": {
                "type": "string",
                "description": "Unit to promote to master (eg. postgresql/3).",
            }
        },
        "required": ["master"],
    },
    "wal-e-backup": {
        "description": "Run a wal-e backup to cloud storage now. Requires "
        "WAL shipping to be enabled with wal-e. Action terminates when the "
        "backup is complete.\n",
        "params": {
            "prune": {
                "type": "boolean",
                "default": "False",
                "description": "Run the configured prune step if the backup "
                "completes successfully, the same as the regularly scheduled "
                "backup task.\n",
            }
        },
    },
    "wal-e-list-backups": {
        "description": "List backups available for PITR and their metadata.\n",
        "params": {
            "storage-uri": {
                "type": "string",
                "default": "",
                "description": "The WAL-E storage URI to search for "
                "backups.\n",
            }
        },
    },
    "wal-e-restore": {
        "description": "PITR database recovery from configured wal-e "
        "store. THIS WILL DESTROY YOUR EXISTING DATA. Most of these "
        "options correspond to PostgreSQL recovery target settings, "
        "documented at http://www.postgresql.org/docs/current/static/"
        "recovery-target-settings.html.\n",
        "params": {
            "target-time": {
                "type": "string",
                "default": "",
                "description": "Target time to recovery database to in "
                "ISO8601 format. By default recovers to the latest "
                "available.\n",
            },
            "target-timeline": {
                "type": "string",
                "default": "latest",
                "description": "The timeline to recover to. Set to an empty "
                "string to recover along the same timeline that was current "
                "when the backup was taken. The default value 'latest' will "
                "to recover to the latest available timeline, following any "
                "promotions. Other values will recover along that specific "
                "timeline.\n",
            },
            "storage-uri": {
                "type": "string",
                "description": "The WAL-E storage URI to recover from. If you "
                "are rewinding a deployment to an earlier point in time, this "
                "may be the same as the wal_e_storage_uri configuration option"
                ". See the WAL-E or wal_e_storage_uri configuration option "
                "documentation for supported syntax. Requires the relevant "
                "os_*, aws_* or  wabs_* configuration options to be specified."
                "\n",
            },
            "backup-name": {
                "type": "string",
                "default": "LATEST",
                "description": "The name of the backup to recover from. Use "
                "the wal-e-list-backups action to see what is available. By "
                "default, the most recent backup is used. The selected backup "
                "must have been created before any specified target-time.\n",
            },
            "confirm": {
                "type": "boolean",
                "default": "False",
                "description": "Recovery destroys the current local database "
                "and PITR backups. If this option is false, the action "
                "will just report details of what will be destroyed. "
                "Set this option to true to perform the recovery.\n",
            },
        },
        "required": ["storage-uri"],
    },
}


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
