from datetime import datetime

from flask import (
    Blueprint,
    render_template,
    make_response,
    current_app as app,
    redirect,
    abort,
)
from flask.json import jsonify
from github import Github
from os import getenv

from webapp.integrations.logic import Interfaces

interface_logic = Interfaces()

integrations = Blueprint(
    "integrations",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)


def get_interfaces():
    interfaces = interface_logic.get_interfaces()

    response = {
        "interfaces": interfaces,
        "size": len(interfaces),
    }
    return response


@integrations.route("/integrations.json")
def interfaces_json():
    return get_interfaces()


@integrations.route("/integrations", defaults={"path": ""})
def all_interfaces(path):
    if not getenv("ENVIRONMENT") in ["devel", "staging"]:
        return render_template("404.html")

    response = get_interfaces()
    context = {"interfaces": response["interfaces"]}
    return render_template("interfaces/index.html", **context)


@integrations.route("/integrations/<path:path>")
def single_interface(path):
    is_draft = path.endswith("draft")
    interface = None

    if is_draft:
        response = get_single_interface(path.replace("/draft", ""), "draft")
    else:
        response = get_single_interface(path, "")

    interface = eval(response.data.decode("utf-8"))

    if (
        "status" not in interface
        and "other_charms" in interface
        and len(interface["other_charms"]["providers"]) == 0
        and len(interface["other_charms"]["requirers"]) == 0
    ):
        return abort(404)

    if (
        not is_draft
        and "status" in interface
        and interface["status"] == "draft"
    ):
        return redirect(f"/integrations/{path}/draft")

    context = {"interface": interface}
    return render_template("interfaces/index.html", **context)


@integrations.route(
    "/integrations/<interface_name>.json", defaults={"status": ""}
)
@integrations.route("/integrations/<interface_name>/<status>.json")
def get_single_interface(interface_name, status):
    repo_has_interface = interface_logic.repo_has_interface(interface_name)

    api = app.store_api
    other_requirers = api.find(requires=[interface_name]).get("results", [])
    other_providers = api.find(provides=[interface_name]).get("results", [])

    res = {}
    # check if interface exists in github repo
    if not repo_has_interface:
        res["other_charms"] = {
            "providers": other_providers,
            "requirers": other_requirers,
        }
        return jsonify(res)

    interface = interface_logic.get_interface_from_path(interface_name)

    readme_contentfile = interface_logic.get_interface_cont_from_repo(
        interface_name, status, "README.md", interface["version"]
    )
    last_modified = datetime.strptime(
        readme_contentfile[0].last_modified, "%a, %d %b %Y %H:%M:%S %Z"
    ).isoformat()

    readme = readme_contentfile[0].decoded_content.decode("utf-8")

    res["body"] = interface_logic.convert_readme(
        interface_name, f"v{interface['version']}", readme, 2
    )

    res["name"] = interface_logic.get_interface_name_from_readme(readme)
    res["charms"] = {
        "providers": interface["providers"],
        "requirers": interface["requirers"],
    }
    res["last_modified"] = last_modified
    res["status"] = interface["status"]

    res["version"] = interface["version"]

    res["other_charms"] = {
        "providers": other_providers,
        "requirers": other_requirers,
    }

    response = make_response(res)
    response.cache_control.max_age = "3600"
    return response
