from datetime import datetime

from flask import Blueprint, render_template, make_response, current_app as app
from github import Github
from os import getenv

from webapp.interfaces.logic import (
    get_public_interfaces_from_readme,
    get_latest_version,
    get_short_description_from_readme,
    convert_readme,
    get_interface_name_from_readme,
    get_interface_cont_from_repo,
    get_interface_yml,
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
    
    interfaces = get_public_interfaces_from_readme(readme)

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

    response = {
        "interfaces": interfaces,
        "size": len(interfaces),
    }
    response = make_response(response)
    response.cache_control.max_age = "3600"
    return response


@interfaces.route("/interfaces", defaults={"path": ""})
@interfaces.route("/interfaces/<path:path>")
def all_interfaces(path):
    if not getenv("ENVIRONMENT") in ["devel", "staging"]:
        return render_template("404.html")
    return render_template("interfaces/index.html")


@interfaces.route("/interfaces/<interface>.json")
def single_interface(interface):
    content = get_interface_cont_from_repo(interface, "README.md")
    last_modified = datetime.strptime(
        content[0].last_modified, "%a, %d %b %Y %H:%M:%S %Z"
    ).isoformat()
    version = get_latest_version(interface)

    try:
        readme = content[0].decoded_content.decode("utf-8")
        api = app.store_api
        other_requirers = api.find(requires=[interface]).get("results", [])
        other_providers = api.find(provides=[interface]).get("results", [])

        res = convert_readme(interface, version, readme, 2)

        res["name"] = get_interface_name_from_readme(readme)
        res["charms"] = get_interface_yml(interface)
        res["version"] = version
        res["other_charms"] = {
            "providers": other_providers,
            "requirers": other_requirers,
        }
        res["last_modified"] = last_modified

        response = make_response(res)
        response.cache_control.max_age = "36000"
        return response
    except Exception:
        return "An error occurred!"
