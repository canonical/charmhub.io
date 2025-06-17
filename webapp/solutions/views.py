import os
import json
from flask import Blueprint, abort, render_template
from webapp.decorators import redirect_uppercase_to_lowercase

solutions = Blueprint(
    "solutions",
    __name__,
    template_folder="../templates/solutions",
    static_folder="../static",
)

DATA_PATH = os.path.join(
    os.path.dirname(__file__), "mock_solutions.json"
)

def load_solutions():
    with open(DATA_PATH, "r", encoding="utf‑8") as f:
        return json.load(f)

@solutions.route("/solutions")
def list_solutions():
    solutions = load_solutions()
    return render_template("solutions/index.html", solutions=solutions)

@solutions.route("/solutions/<entity_name>")
@redirect_uppercase_to_lowercase
def solution_details(entity_name):
    solutions = load_solutions()
    solution = next((s for s in solutions if s["entity_name"] == entity_name), None)
    if not solution:
        abort(404)
    return render_template("solutions/solutions_details_layout.html", solution=solution)
