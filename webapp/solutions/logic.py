import os
import requests
from flask import session as flask_session
from webapp.solutions.auth import login

session = requests.Session()

SOLUTIONS_API_BASE = os.getenv(
    "SOLUTIONS_API_BASE", "http://localhost:5000/api"
)


def get_cached_token(username):
    token_key = f"solutions_token_{username}"

    if token_key in flask_session:
        return flask_session[token_key]

    return refresh_token(username)


def refresh_token(username):
    token_key = f"solutions_token_{username}"

    token = login(username)
    flask_session[token_key] = token

    return token


def make_authenticated_request(method, url, username, **kwargs):
    token = get_cached_token(username)

    headers = kwargs.get("headers", {})
    headers["Authorization"] = f"Bearer {token}"
    kwargs["headers"] = headers

    response = session.request(method, url, **kwargs)

    if response.status_code == 401:
        token = refresh_token(username)
        headers["Authorization"] = f"Bearer {token}"
        response = session.request(method, url, **kwargs)

    return response


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
        resp = make_authenticated_request(
            "GET",
            f"{SOLUTIONS_API_BASE}/publisher/solutions",
            username,
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
    """
    solutions = get_publisher_solutions(username)
    return bool(solutions and len(solutions) > 0)
