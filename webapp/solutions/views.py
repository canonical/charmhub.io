import os
import json
from flask import Blueprint, abort, render_template, request
from webapp.decorators import redirect_uppercase_to_lowercase
from webapp.store_api import publisher_gateway
from webapp.helpers import markdown_to_html
from webapp.solutions.logic import get_solution_from_backend
from concurrent.futures import ThreadPoolExecutor, as_completed

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

    # Fetch charm data in parallel
    charm_names = [c["name"] for c in solution.get("charms", [])]

    def fetch(name):
        return name, get_charm_data(name)

    charm_data_map = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch, name): name for name in charm_names}
        for future in as_completed(futures):
            name, data = future.result()
            if data:
                charm_data_map[name] = data

    # Preserve charm order
    solution_charms = [
        charm_data_map[name] for name in charm_names if name in charm_data_map
    ]

    solution["charms"] = solution_charms

    return render_template(
        "solutions/solutions_base_layout.html",
        solution=solution,
    )
