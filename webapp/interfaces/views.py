from flask import Blueprint, render_template, make_response, current_app as app
from github import Github
from os import getenv

from webapp.interfaces.logic import (
    get_interfaces_from_mrkd_table,
    get_short_description_from_readme,
    filter_interfaces_by_status,
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
        version = "v{}".format(inter["version"])
        interface = inter["name"]
        charms = get_interface_yml(interface, version)

        live_interfaces[i]["provider_count"] = len(charms["providers"])
        live_interfaces[i]["consumer_count"] = len(charms["consumers"])

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


@interfaces.route("/interfaces/<interface>-<version>.json")
def single_interface(interface, version):
    content = get_interface_cont_from_repo(interface, version, "README.md")
    try:
        readme = content[0].decoded_content.decode("utf-8")
        api = app.store_api
        other_requirers = api.find(requires=[interface]).get("results", [])
        other_providers = api.find(provides=[interface]).get("results", [])

        res = convert_readme(interface, version, readme, 2)

        res["name"] = get_interface_name_from_readme(readme)
        res["charms"] = get_interface_yml(interface, version)
        res["version"] = version
        res["other_charms"] = {
            "providers": other_providers,
            "requirers": other_requirers,
        }

        response = make_response(res)
        response.cache_control.max_age = "36000"
        return response
    except Exception:
        return "An error occurred!"
