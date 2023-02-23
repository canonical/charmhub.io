APP_NAME = "charmhub.io"
DETAILS_VIEW_REGEX = "[A-Za-z0-9-]*[A-Za-z][A-Za-z0-9-]*"

CATEGORIES = [
    {"slug": "ai-ml", "name": "AI/ML"},
    {"slug": "big-data", "name": "Big Data"},
    {"slug": "cloud", "name": "Cloud"},
    {"slug": "containers", "name": "Containers"},
    {"slug": "databases", "name": "Databases"},
    {"slug": "logging-tracing", "name": "Logging and Tracing"},
    {"slug": "monitoring", "name": "Monitoring"},
    {"slug": "networking", "name": "Networking"},
    {"slug": "security", "name": "Security"},
    {"slug": "storage", "name": "Storage"},
]

SEARCH_FIELDS = [
    "result.categories",
    "result.summary",
    "result.media",
    "result.title",
    "result.publisher.display-name",
    "default-release.revision.revision",
    "default-release.channel",
    "result.deployable-on",
]
