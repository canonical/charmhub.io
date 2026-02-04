import os
from canonicalwebteam.flask_base.env import load_plain_env_variables


# Load the prefixed FLASK_* env vars into env vars without the prefix. We have
# to do this explicitly here because otherwise the config module is imported
# by other files before the FlaskBase app gets initialized and does this by
# itself, meaning that the variables below are not set correctly
load_plain_env_variables()

APP_NAME = "charmhub"
DETAILS_VIEW_REGEX = "[A-Za-z0-9-]*[A-Za-z][A-Za-z0-9-]*"

CATEGORIES = [
    {"slug": "ai-ml", "name": "AI/ML"},
    {"slug": "big-data", "name": "Big data"},
    {"slug": "cloud", "name": "Cloud"},
    {"slug": "containers", "name": "Containers"},
    {"slug": "databases", "name": "Databases"},
    {"slug": "logging-tracing", "name": "Logging and tracing"},
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

SENTRY_DSN = os.getenv("SENTRY_DSN", "").strip()

# Vite integration config values
IS_DEVELOPMENT = os.getenv("ENVIRONMENT", "devel") == "devel"

VITE_CONFIG = {
    "VITE_MODE": "development" if IS_DEVELOPMENT else "production",
    "VITE_PORT": os.getenv("VITE_PORT", 5173),
    "VITE_OUTDIR": os.getenv("VITE_OUTDIR", "static/js/dist/vite"),
    # VITE_REACT controls whether React hot module reload scripts are injected
    # when running in dev mode; the setting has no effect in prod mode
    "VITE_REACT": True,
}
