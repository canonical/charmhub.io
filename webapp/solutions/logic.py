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
        # public preview endpoint for published solutions
        resp = session.get(
            f"{SOLUTIONS_API_BASE}/solutions/preview/{uuid}", timeout=5
        )
        if resp.status_code == 200:
            return resp.json()

        # fallback for publishers to preview their own draft solutions
        username = flask_session.get("account", {}).get("username")
        if username:
            auth_resp = make_authenticated_request(
                "GET",
                f"{SOLUTIONS_API_BASE}/publisher/solutions",
                username,
                timeout=5,
            )
            if auth_resp.status_code == 200:
                solutions = auth_resp.json()
                for solution in solutions:
                    if solution.get("hash") == uuid:
                        return solution
    except Exception:
        pass
    return None


def get_published_solution_by_name(name):
    try:
        resp = session.get(f"{SOLUTIONS_API_BASE}/solutions/{name}", timeout=5)
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


def register_solution(username, data):
    try:
        resp = make_authenticated_request(
            "POST",
            f"{SOLUTIONS_API_BASE}/publisher/solutions",
            username,
            json=data,
            timeout=10,
        )
    except Exception as e:
        return {"error": f"Failed to communicate with solutions service: {e}"}

    if resp.status_code == 201:
        return resp.json()

    if resp.status_code == 400:
        try:
            error_data = resp.json()
            return (
                error_data
                if "error-list" in error_data
                else {"error": error_data.get("error", "Invalid request data")}
            )
        except Exception:
            return {"error": f"API error (400): {resp.text}"}

    return {"error": f"API error ({resp.status_code}): {resp.text}"}


def update_solution(username, name, revision, data):
    try:
        resp = make_authenticated_request(
            "PATCH",
            f"{SOLUTIONS_API_BASE}/publisher/solutions/{name}/{revision}",
            username,
            json=data,
            timeout=10,
        )
    except Exception as e:
        return {"error": f"Failed to communicate with solutions service: {e}"}

    if resp.status_code == 200:
        return resp.json()

    if resp.status_code == 400:
        try:
            error_data = resp.json()
            return (
                error_data
                if "error-list" in error_data
                else {"error": error_data.get("error", "Invalid request data")}
            )
        except Exception:
            return {"error": f"API error (400): {resp.text}"}

    return {"error": f"API error ({resp.status_code}): {resp.text}"}


def get_user_teams_for_solutions(username):
    """
    Gets LP groups of a user so they can choose
    which group to publish the solution under
    """
    try:
        resp = make_authenticated_request(
            "GET",
            f"{SOLUTIONS_API_BASE}/me",
            username,
            timeout=5,
        )

        if resp.status_code == 200:
            user_data = resp.json()
            teams = user_data.get("user", {}).get("teams", [])
            return sorted(teams)

    except Exception:
        pass

    return []
