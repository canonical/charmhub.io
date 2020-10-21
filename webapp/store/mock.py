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
