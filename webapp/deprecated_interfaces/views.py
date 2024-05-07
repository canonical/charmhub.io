from flask import (
    Blueprint,
    render_template,
    make_response,
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
def all_interfaces(path):
    if not getenv("ENVIRONMENT") in ["devel", "staging"]:
        return render_template("404.html")

    response = get_interfaces()
    interfaces = eval(response.data.decode("utf-8"))
    context = {"interfaces": interfaces["interfaces"]}

    return render_template("interfaces/index.html", **context)


@interfaces.route("/interfaces/<path:path>")
def deprecated_single_interface(path):
    return redirect(f"/integrations/{path}")


@interfaces.route("/interfaces/<interface_name>.json", defaults={"status": ""})
@interfaces.route("/interfaces/<interface_name>/<status>.json")
def deprecated_get_single_interface(interface_name, status):
    return redirect(f"/integrations/{interface_name}/{status}.json")
