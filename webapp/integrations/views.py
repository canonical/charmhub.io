from datetime import datetime
from flask import (
    Blueprint,
    render_template,
    abort,
)
from flask.json import jsonify

from redis_cache.cache_utility import redis_cache
from webapp.integrations.logic import interface_logic
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway


integrations = Blueprint(
    "integrations",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)


@trace_function
@integrations.route("/integrations.json")
def interfaces_json():
    interfaces = interface_logic.get_interfaces()

    response = {
        "interfaces": interfaces,
        "size": len(interfaces),
    }

    return response


@trace_function
@integrations.route("/integrations")
def all_interfaces():
    interfaces = interface_logic.get_interfaces()
    context = {"interfaces": interfaces}
    return render_template("interfaces/index.html", **context)


def fetch_interface_details(interface_name):
    key = f"get-interface-details:{interface_name}"
    interface_details = redis_cache.get(key, expected_type=dict)
    if interface_details:
        return interface_details

    other_requirers = publisher_gateway.find(requires=[interface_name]).get(
        "results", []
    )
    other_providers = publisher_gateway.find(provides=[interface_name]).get(
        "results", []
    )

    res = {
        "other_charms": {
            "providers": other_providers,
            "requirers": other_requirers,
        }
    }

    interface = interface_logic.get_interface_from_path(interface_name)
    if interface is None:
        if other_providers or other_requirers:
            return res
        return None

    readme_path = (
        f"interfaces/{interface_name}/interface/v{interface['version']}/README.md"
    )
    readme_contentfile = interface_logic.repo.get_contents(readme_path)
    readme = readme_contentfile.decoded_content.decode("utf-8")
    last_modified = datetime.strptime(
        readme_contentfile.last_modified, "%a, %d %b %Y %H:%M:%S %Z"
    ).isoformat()

    res.update(
        {
            "body": interface_logic.convert_readme(
                interface_name, f"v{interface['version']}", readme, 2
            ),
            "name": interface_logic.get_interface_name_from_readme(readme),
            "charms": {
                "providers": interface["providers"],
                "requirers": interface["requirers"],
            },
            "last_modified": last_modified,
            "status": interface["status"],
            "version": interface["version"],
        }
    )
    redis_cache.set(key, res, ttl=86400)
    return res


@trace_function
@integrations.route("/integrations/<path:path>")
def get_single_interface(path):
    interface_data = fetch_interface_details(path)

    if interface_data is None:
        return abort(404)

    context = {"interface": interface_data}
    return render_template("interfaces/index.html", **context)


@trace_function
@integrations.route("/integrations/<interface_name>.json")
def get_single_interface_json(interface_name):
    interface_data = fetch_interface_details(interface_name)

    if interface_data is None:
        return jsonify({"error": "Interface not found"}), 404

    return jsonify(interface_data)
