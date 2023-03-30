from datetime import datetime

from flask import (
    Blueprint,
    render_template,
    make_response,
    current_app as app,
)
from github import Github
from os import getenv

from webapp.interfaces.logic import (
    get_interface_status,
    get_public_interfaces_from_readme,
    get_interface_latest_version,
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


def get_interfaces():
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


@interfaces.route("/interfaces.json")
def interfaces_json():
    return get_interfaces()


@interfaces.route("/interfaces", defaults={"path": ""})
@interfaces.route("/interfaces/<path:path>")
def all_interfaces(path):
    if not getenv("ENVIRONMENT") in ["devel", "staging"]:
        return render_template("404.html")
    return render_template("interfaces/index.html")


@interfaces.route("/interfaces/<interface_name>/<status>.json")
def get_single_interface(interface_name, status):
    interfaces = get_interfaces().get_json()["interfaces"]
    interface_has_status = get_interface_status(
        interfaces, interface_name, status
    )
    # if the user sends request for a status that does not exist
    if not interface_has_status:
        if status == "live":
            status = "draft"
        else:
            status = "live"
    version = get_interface_latest_version(interfaces, interface_name, status)
    content = get_interface_cont_from_repo(
        interfaces, interface_name, status, "README.md"
    )

    last_modified = datetime.strptime(
        content[0].last_modified, "%a, %d %b %Y %H:%M:%S %Z"
    ).isoformat()

    try:
        readme = content[0].decoded_content.decode("utf-8")
        api = app.store_api
        other_requirers = api.find(requires=[interface_name]).get(
            "results", []
        )
        other_providers = api.find(provides=[interface_name]).get(
            "results", []
        )

        res = convert_readme(interface_name, version, readme, 2)

        res["name"] = get_interface_name_from_readme(readme)
        res["charms"] = get_interface_yml(interfaces, interface_name, status)
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
