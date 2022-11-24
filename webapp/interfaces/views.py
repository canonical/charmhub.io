from flask import Blueprint, render_template, make_response
from github import Github
from os import getenv

from webapp.interfaces.logic import (
    get_interfaces_from_mrkd_table,
    get_short_description_from_readme,
    filter_interfaces_by_status,
)


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
    repo = github_client.get_repo("canonical/charm-relation-interfaces")
    readme = repo.get_contents("README.md").decoded_content.decode("utf-8")

    interfaces = get_interfaces_from_mrkd_table(readme)
    live_interfaces = filter_interfaces_by_status(interfaces, "Live")

    for i, inter in enumerate(live_interfaces):
        try:
            interface_readme = repo.get_contents(
                inter["readme_path"]
            ).decoded_content.decode("utf-8")
            description = get_short_description_from_readme(interface_readme)
        except Exception:
            # Some draft interfaces are missing a readme
            description = ""

        live_interfaces[i]["description"] = description

    response = {
        "interfaces": live_interfaces,
        "size": len(live_interfaces),
    }
    response = make_response(response)
    response.cache_control.max_age = "3600"

    return response


@interfaces.route("/interfaces", defaults={"path": ""})
@interfaces.route("/interfaces/<path:path>")
def all_interfaces(path):
    return render_template("interfaces/index.html")


# @interfaces.route("/interfaces/<string:interface_slug>")
# def interface_page(interface_slug, path=None):

#     context = {}

#     return render_template("interfaces/document.html", **context)
