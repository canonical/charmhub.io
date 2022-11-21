from flask import Blueprint, render_template
from github import Github
from os import getenv

from webapp.interfaces.logic import (
    get_interfaces_from_mrkd_table,
    get_short_description_from_readme,
)


interfaces = Blueprint(
    "interfaces",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

# Todo create token
github_client = Github(GITHUB_TOKEN)


@interfaces.route("/interfaces.json")
def interfaces_json():
    repo = github_client.get_repo("canonical/charm-relation-interfaces")
    readme = repo.get_contents("README.md").decoded_content.decode("utf-8")

    interfaces = get_interfaces_from_mrkd_table(readme)

    for i, inter in enumerate(interfaces):
        try:
            interface_readme = repo.get_contents(
                inter["readme_path"]
            ).decoded_content.decode("utf-8")
            description = get_short_description_from_readme(interface_readme)
        except Exception:
            # Some draft interfaces are missing a readme
            description = ""

        interfaces[i]["description"] = description

    return {
        "interfaces": interfaces,
        "size": len(interfaces),
    }


@interfaces.route("/interfaces")
def all_interfaces():
    return render_template("interfaces/index.html")


@interfaces.route("/interfaces/<string:interface_slug>")
def interface_page(interface_slug, path=None):

    context = {}

    return render_template("interfaces/document.html", **context)
