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
    types = params.get("types", "")
    limit = int(params.get("type_limit", 5))

    valid_types = {
        "docs": search_docs,
        "topics": search_topics,
        "charms": search_charms,
        "bundles": search_bundles,
    }
    if types:
        result = {}
        search_types = types.split(",")
        for type in search_types:
            if type not in valid_types.keys():
                return {"error": "Invalid search type"}
            if type == "docs" or type == "topics":
                result[type] = valid_types[type](term, 1, limit, False)
            else:
                result[type] = valid_types[type](term, limit)
    else:
        result = {
            "charms": search_charms(term, limit),
            "bundles": search_bundles(term, limit),
            "docs": search_docs(term, 1, limit, False),
            "topics": search_topics(term, 1, limit, False),
        }
    return result


@search.route("/all-charms")
@search.route("/all-bundles")
def all_charms() -> dict:
    query = request.args.get("q", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("type_limit", 50))
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
    limit = int(request.args.get("type_limit", 50))

    all_topics = search_docs(search_term, page, limit, True)
    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit

    return {"topics": all_topics[start:end], "total_pages": total_pages}


@search.route("/all-topics")
def all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("type_limit", 50))

    all_topics = search_topics(search_term, page, limit, True)

    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit

    return {"topics": all_topics[start:end], "total_pages": total_pages}
