from flask import Blueprint


charmhub_bp = Blueprint(
    "charmhub_bp",
    __name__,
    template_folder="../templates",
    static_folder="../static",
)
