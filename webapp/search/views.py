from flask import (
    Blueprint,
    jsonify,
    request,
    render_template,
)
from talisker import requests
from canonicalwebteam.store_api.publishergw import PublisherGW

from webapp.config import SEARCH_FIELDS
from webapp.search.logic import (
    search_docs,
    search_topics,
    search_charms,
    search_bundles,
)
from webapp.observability.utils import trace_function


search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)

publisher_gateway = PublisherGW("charm", requests.get_session())


@trace_function
@search.route("/all-search")
def all_search():
    return render_template("all-search.html")


@trace_function
@search.route("/all-search.json")
def all_search_json():
    params = request.args
    term = params.get("q")
    limit = int(params.get("limit", 5))

    if not term:
        return {"error": "No search term provided"}

    result = {
        "charms": search_charms(term)[:limit],
        "bundles": search_bundles(term)[:limit],
        "docs": search_docs(term)[:limit],
        "topics": search_topics(term, 1, False)[:limit],
    }
    return jsonify(result)


@trace_function
@search.route("/all-charms")
@search.route("/all-bundles")
def all_charms() -> dict:
    query = request.args.get("q", "")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    packages = publisher_gateway.find(query, fields=SEARCH_FIELDS)
    package_type = request.path[1:-1].split("-")[1]
    result = [
        package
        for package in packages["results"]
        if package["type"] == package_type
    ]
    start = (page - 1) * limit
    end = start + limit
    return {f"{package_type}s": result[start:end]}


@trace_function
@search.route("/all-docs")
def all_docs():
    search_term = request.args.get("q")
    limit = int(request.args.get("limit", 50))

    docs = search_docs(search_term)[:limit]

    return jsonify({"docs": docs})


@trace_function
@search.route("/all-topics")
def all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))

    all_topics = search_topics(search_term, page, True)[:limit]

    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit

    return jsonify(
        {"topics": all_topics[start:end], "total_pages": total_pages}
    )
