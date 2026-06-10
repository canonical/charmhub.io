import logging
from flask import (
    Blueprint,
    jsonify,
    request,
    render_template,
)
from redis_cache.cache_utility import redis_cache
from webapp.config import SEARCH_FIELDS
from webapp.search.logic import (
    search_docs,
    search_topics,
    search_charms,
    search_bundles,
)
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway


logger = logging.getLogger(__name__)

search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)


@trace_function
@search.route("/all-search")
def all_search():
    return render_template("all-search.html")


@trace_function
@search.route("/all-search.json")
def all_search_json():
    params = request.args
    term = params.get("q")
    limit = params.get("limit", default=5, type=int)

    if not term:
        return {"error": "No search term provided"}
    key = ("all-search-json", {"q": term, "limit": limit})
    result = redis_cache.get(key, expected_type=dict)
    if result:
        return jsonify(result)
    result = {
        "charms": search_charms(term)[:limit],
        "bundles": search_bundles(term)[:limit],
        "docs": search_docs(term)[:limit],
        "topics": search_topics(term, 1, False)[:limit],
    }
    redis_cache.set(key, result, ttl=600)
    return jsonify(result)


@trace_function
@search.route("/all-charms")
@search.route("/all-bundles")
def all_charms() -> dict:
    query = request.args.get("q", "")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=50, type=int)
    key = (f"{request.path}", {"q": query, "pg": page})
    cached_page = redis_cache.get(key, expected_type=dict)
    if cached_page:
        return jsonify(cached_page)
    packages = publisher_gateway.find(query, fields=SEARCH_FIELDS)
    package_type = request.path[1:-1].split("-")[1]
    result = [
        package
        for package in packages["results"]
        if package["type"] == package_type
    ]
    start = (page - 1) * limit
    end = start + limit
    result = {f"{package_type}s": result[start:end]}
    redis_cache.set(key, result, ttl=600)
    return jsonify(result)


@trace_function
@search.route("/all-docs")
def all_docs():
    search_term = request.args.get("q")
    limit = request.args.get("limit", default=50, type=int)

    docs = search_docs(search_term)[:limit]

    return jsonify({"docs": docs})


@trace_function
@search.route("/all-topics")
def all_topics():
    search_term = request.args.get("q")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=50, type=int)

    key = ("all-topics", {"q": search_term, "pg": page})
    topics = redis_cache.get(key, expected_type=dict)
    if topics:
        return jsonify(topics)

    all_topics = search_topics(search_term, page, True)[:limit]
    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit
    topics = {"topics": all_topics[start:end], "total_pages": total_pages}
    redis_cache.set(key, topics, ttl=600)
    return jsonify(topics)


@search.route("/validate-charm")
def validate_charm():
    charm_name = request.args.get("name", "").strip()

    if not charm_name:
        return jsonify({"exists": False, "error": "No charm name provided"})

    try:
        charm = publisher_gateway.get_item_details(charm_name)

        if charm and "name" in charm:
            return jsonify({"exists": True, "name": charm["name"]})

        return jsonify({"exists": False})
    except Exception as e:
        logger.exception(f"Failed to validate charm: {e}")
        return jsonify({"exists": False, "error": "Network or API error"})
