from flask import Blueprint, request, current_app as app

from webapp.config import SEARCH_FIELDS
from webapp.search.logic import (
    search_docs,
    search_topics,
    search_charms,
    search_bundles,
)


search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)


@search.route("/all-search")
def all_search():
    params = request.args
    term = params.get("q")
    limit = int(params.get("limit", 5))

    result = {
        "charms": search_charms(term)[:limit],
        "bundles": search_bundles(term)[:limit],
        "docs": search_docs(term, 1, False)[:limit],
        "topics": search_topics(term, 1, False)[:limit],
    }
    return result


@search.route("/all-charms")
@search.route("/all-bundles")
def all_charms() -> dict:
    query = request.args.get("q", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    packages = app.store_api.find(query, fields=SEARCH_FIELDS)
    package_type = request.path[1:-1].split("-")[1]
    result = [
        package
        for package in packages["results"]
        if package["type"] == package_type
    ]
    start = (page - 1) * limit
    end = start + limit
    return {f"{package_type}s": result[start:end]}


@search.route("/all-docs")
def all_docs():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))

    all_topics = search_docs(search_term, page, True)[:limit]
    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit

    return {"topics": all_topics[start:end], "total_pages": total_pages}


@search.route("/all-topics")
def all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))

    all_topics = search_topics(search_term, page, True)[:limit]

    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit

    return {"topics": all_topics[start:end], "total_pages": total_pages}
