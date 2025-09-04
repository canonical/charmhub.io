import os
import requests
from webapp.solutions.auth import login

session = requests.Session()

SOLUTIONS_API_BASE = os.getenv(
    "SOLUTIONS_API_BASE", "http://localhost:5000/api"
)


def get_solution_from_backend(uuid):
    try:
        resp = session.get(
            f"{SOLUTIONS_API_BASE}/solutions/preview/{uuid}", timeout=5
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def get_publisher_solutions(username):
    try:
        token = login(username)
        headers = {"Authorization": f"Bearer {token}"}

        resp = session.get(
            f"{SOLUTIONS_API_BASE}/publisher/solutions",
            headers=headers,
            timeout=5,
        )
        if resp.status_code == 200:
            solutions = resp.json()
            return solutions if solutions else []

    except Exception:
        pass

    return []


def publisher_has_solutions(username):
    """
    Checks if the user logged in has access to any solutions
    - adds simple caching because it's quite slow right now
    """
    from flask import session as flask_session

    cache_key = f"has_solutions_{username}"
    if cache_key in flask_session:
        return flask_session[cache_key]

    solutions = get_publisher_solutions(username)
    has_solutions = bool(solutions and len(solutions) > 0)

    flask_session[cache_key] = has_solutions

    return has_solutions
