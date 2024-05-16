from flask import (
    Blueprint,
    redirect,
)
from github import Github
from os import getenv

from webapp.integrations.logic import Interfaces

interface_logic = Interfaces()

interfaces = Blueprint(
    "interfaces",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)


@interfaces.route("/interfaces.json")
def interfaces_json():
    return redirect("/integrations.json")


@interfaces.route("/interfaces", defaults={"path": ""})
def all_interfaces(path):
    return redirect("/integrations")


@interfaces.route("/interfaces/<path:path>")
def deprecated_single_interface(path):
    return redirect(f"/integrations/{path}")


@interfaces.route("/interfaces/<interface_name>.json", defaults={"status": ""})
@interfaces.route("/interfaces/<interface_name>/<status>.json")
def deprecated_get_single_interface(interface_name, status):
    return redirect(f"/integrations/{interface_name}/{status}.json")
