import os
import json
from flask import Blueprint, abort, render_template, request
from webapp.decorators import redirect_uppercase_to_lowercase
from webapp.store_api import publisher_gateway
from webapp.helpers import markdown_to_html
from webapp.helpers import get_solution_from_backend

solutions = Blueprint(
    "solutions",
    __name__,
    template_folder="../templates/solutions",
    static_folder="../static",
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "mock_solutions.json")

FIELDS = [
    "result.media",
    "result.title",
    "result.summary",
    "result.publisher.display-name",
    "result.categories",
    "result.deployable-on",
]


def load_solutions():
    with open(DATA_PATH, "r", encoding="utf‑8") as f:
        return json.load(f)


def get_charm_data(charm_name):
    """Fetch charm details from Charmhub API."""
    try:
        charm = publisher_gateway.get_item_details(charm_name, fields=FIELDS)
    except Exception:
        return None

    if not charm or "result" not in charm:
        return None

    icon = None
    if charm["result"].get("media"):
        icon = charm["result"]["media"][0]["url"]
    else:
        icon = (
            "https://assets.ubuntu.com/v1/"
            "be6eb412-snapcraft-missing-icon.svg"
        )

    return {
        "name": charm_name,
        "title": charm["result"].get("title", charm_name),
        "summary": charm["result"].get("summary", ""),
        "publisher": charm["result"].get("publisher"),
        "icon": icon,
        "url": f"https://charmhub.io/{charm_name}",
        "categories": charm["result"].get("categories"),
        "deployable-on": charm["result"].get("deployable-on"),
    }


@solutions.route("/solutions")
def list_solutions():
    solutions_data = load_solutions()
    return render_template("solutions/index.html", solutions=solutions_data)


@solutions.route("/solutions/<name>")
@redirect_uppercase_to_lowercase
def solution_details(name):
    preview_id = request.args.get("preview")

    if preview_id:
        solution = get_solution_from_backend(preview_id)
        print(f"[DEBUG] solution = {solution}")
        if not solution:
            abort(404)
    else:
        solutions_data = load_solutions()
        solution = next(
            (s for s in solutions_data if s["name"] == name),
            None,
        )
        if not solution:
            abort(404)

    solution["description_html"] = markdown_to_html(
        solution.get("description", "")
    )

    solution_charms = []
    for charm in solution.get("charms", []):
        charm_info = get_charm_data(charm["charm_name"])
        if charm_info:
            solution_charms.append(charm_info)

    solution["charms"] = solution_charms

    return render_template(
        "solutions/solutions_base_layout.html",
        solution=solution,
    )
