import os
import requests
from flask import Blueprint, abort, render_template, request
from webapp.decorators import redirect_uppercase_to_lowercase
from webapp.store_api import publisher_gateway
from webapp.helpers import markdown_to_html
from webapp.solutions.logic import get_solution_from_backend
from concurrent.futures import ThreadPoolExecutor, as_completed
from webapp.solutions.logic import get_published_solution_by_name


solutions = Blueprint(
    "solutions",
    __name__,
    template_folder="../templates/solutions",
    static_folder="../static",
)

FIELDS = [
    "result.media",
    "result.title",
    "result.summary",
    "result.publisher.display-name",
    "result.categories",
    "result.deployable-on",
]


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
    try:
        api_base = os.getenv(
            "FLASK_SOLUTIONS_API_BASE", "http://solutions.staging.charmhub.io/api"
        )
        response = requests.get(f"{api_base}/solutions", timeout=5)
        if response.status_code == 200:
            solutions_data = response.json()
        else:
            solutions_data = []
    except Exception:
        solutions_data = []

    return render_template("solutions/index.html", solutions=solutions_data)


def render_solution(solution):
    solution["description_html"] = markdown_to_html(
        solution.get("description", "")
    )

    architecture_explanation = ""
    if solution.get("documentation", {}).get("architecture_explanation"):
        architecture_explanation = solution["documentation"][
            "architecture_explanation"
        ]
    solution["architecture_explanation_html"] = markdown_to_html(
        architecture_explanation
    )

    charm_names = []
    for charm in solution.get("charms", []):
        if isinstance(charm, dict):
            if "name" in charm:
                charm_names.append(charm["name"])
            elif "charm_name" in charm:
                charm_names.append(charm["charm_name"])
            elif "title" in charm:
                charm_names.append(charm["title"])
        elif isinstance(charm, str):
            charm_names.append(charm)

    def fetch(name):
        return name, get_charm_data(name)

    charm_data_map = {}
    if charm_names:
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(fetch, name): name for name in charm_names
            }
            for future in as_completed(futures):
                name, data = future.result()
                if data:
                    charm_data_map[name] = data

    # Preserve charm order
    solution_charms = [
        charm_data_map[name] for name in charm_names if name in charm_data_map
    ]

    solution["charms"] = solution_charms
    return solution


@solutions.route("/solutions/preview/<hash>")
def solution_preview(hash):
    solution = get_solution_from_backend(hash)
    if not solution:
        abort(404)

    solution = render_solution(solution)

    return render_template(
        "solutions/solutions_base_layout.html",
        solution=solution,
        is_preview=True,
    )


@solutions.route("/solutions/<name>")
@redirect_uppercase_to_lowercase
def solution_details(name):
    preview_id = request.args.get("preview")

    if preview_id:
        solution = get_solution_from_backend(preview_id)
        is_preview = True
    else:
        solution = get_published_solution_by_name(name)
        is_preview = False

    if not solution:
        abort(404)

    solution = render_solution(solution)

    return render_template(
        "solutions/solutions_base_layout.html",
        solution=solution,
        is_preview=is_preview,
    )
