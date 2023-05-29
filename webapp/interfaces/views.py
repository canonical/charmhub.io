from datetime import datetime

from flask import (
    Blueprint,
    render_template,
    make_response,
    current_app as app,
)
from flask.json import jsonify
from github import Github
from os import getenv

from webapp.interfaces.logic import Interfaces

interface_logic = Interfaces()

interfaces = Blueprint(
    "interfaces",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)


def get_interfaces():
    interfaces = interface_logic.get_interfaces()
    for i, inter in enumerate(interfaces):
        try:
            interface_readme = interface_logic.repo.get_contents(
                inter["readme_path"]
            ).decoded_content.decode("utf-8")
            description = interface_logic.get_short_description_from_readme(
                interface_readme
            )
        except Exception:
            # Some draft interfaces are missing a readme
            description = ""

        interfaces[i]["description"] = description

    response = {
        "interfaces": interfaces,
        "size": len(interfaces),
    }
    response = make_response(response)
    response.cache_control.max_age = "3600"
    return response


@interfaces.route("/interfaces.json")
def interfaces_json():
    return get_interfaces()


@interfaces.route("/interfaces", defaults={"path": ""})
@interfaces.route("/interfaces/<path:path>")
def all_interfaces(path):
    if not getenv("ENVIRONMENT") in ["devel", "staging"]:
        return render_template("404.html")
    return render_template("interfaces/index.html")


@interfaces.route("/interfaces/<interface_name>.json", defaults={"status": ""})
@interfaces.route("/interfaces/<interface_name>/<status>.json")
def get_single_interface(interface_name, status):
    has_interface = interface_logic.get_interface_list(interface_name)
    if not has_interface:
        return jsonify(error=404, text="Interface not found"), 404

    interface_status = interface_logic.get_interface_status(
        interface_name, status
    )
    # if the user sends request for a status that does not exist
    if not interface_status:
        if status == "live":
            status = "draft"
        else:
            status = "live"
    version = interface_logic.get_interface_latest_version(
        interface_name, status
    )
    readme_contentfile = interface_logic.get_interface_cont_from_repo(
        interface_name, status, "README.md"
    )
    # check if the interface has a readme
    if not readme_contentfile:
        readme = ""
    else:
        last_modified = datetime.strptime(
            readme_contentfile[0].last_modified, "%a, %d %b %Y %H:%M:%S %Z"
        ).isoformat()

        readme = readme_contentfile[0].decoded_content.decode("utf-8")
    api = app.store_api
    other_requirers = api.find(requires=[interface_name]).get("results", [])
    other_providers = api.find(provides=[interface_name]).get("results", [])

    res = {
        "body": interface_logic.convert_readme(
            interface_name, version, readme, 2
        )
    }

    res["name"] = interface_logic.get_interface_name_from_readme(readme)
    res["charms"] = interface_logic.get_interface_yml(interface_name, status)
    res["version"] = version
    res["other_charms"] = {
        "providers": other_providers,
        "requirers": other_requirers,
    }
    res["last_modified"] = last_modified
    response = make_response(res)
    response.cache_control.max_age = "36000"
    return response
