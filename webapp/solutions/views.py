from flask import Blueprint, abort, render_template, request
from webapp.decorators import redirect_uppercase_to_lowercase
from webapp.store_api import publisher_gateway
from webapp.helpers import markdown_to_html
from webapp.solutions.logic import get_solution_from_backend
from concurrent.futures import ThreadPoolExecutor, as_completed
from webapp.solutions.logic import get_published_solution_by_name
from redis_cache.cache_utility import redis_cache


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


@solutions.route("/solutions/preview-draft/<preview_key>")
def solution_preview_draft(preview_key):

    cache_key = f"solution_preview:{preview_key}"
    preview_data = redis_cache.get(cache_key, expected_type=dict)
    if not preview_data:
        abort(404)

    solution = preview_data["solution"]
    form_data = preview_data["form_data"]

    # Merge form data into solution for preview
    preview_solution = {**solution}

    preview_solution.update(
        {
            "title": form_data.get("title", solution.get("title")),
            "summary": form_data.get("summary", solution.get("summary")),
            "description": form_data.get(
                "description", solution.get("description")
            ),
            "terraform_modules": form_data.get("terraform_modules"),
        }
    )

    preview_solution["documentation"] = {
        "main": form_data.get("documentation_main"),
        "source": form_data.get("documentation_source"),
        "get_started": form_data.get("get_started_url"),
        "how_to_operate": form_data.get("how_to_operate_url"),
        "architecture_explanation": form_data.get("architecture_explanation"),
        "submit_a_bug": form_data.get("submit_bug_url"),
        "community_discussion": form_data.get("community_discussion_url"),
    }

    preview_solution["media"] = {
        "icon": form_data.get("icon"),
        "architecture_diagram": form_data.get("architecture_diagram_url"),
    }

    preview_solution["deployable-on"] = [
        {
            "platform": form_data.get("platform"),
            "version": form_data.get("platform_version", []),
            "prerequisites": form_data.get("platform_prerequisites", []),
        }
    ]

    preview_solution["compatibility"] = {
        "juju_versions": form_data.get("juju_versions", []),
    }

    charms_list = form_data.get("charms", [])
    preview_solution["charms"] = [
        {"charm_name": charm} for charm in charms_list
    ]

    preview_solution["use_cases"] = form_data.get("use_cases", [])
    preview_solution["useful_links"] = form_data.get("useful_links", [])

    maintainers_emails = form_data.get("maintainers", [])
    preview_solution["maintainers"] = [
        {"email": email, "display_name": email.split("@")[0]}
        for email in maintainers_emails
    ]

    preview_solution = render_solution(preview_solution)

    return render_template(
        "solutions/solutions_base_layout.html",
        solution=preview_solution,
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
