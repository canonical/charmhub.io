from pprint import pprint
from bs4 import BeautifulSoup
from flask import Blueprint, request, current_app as app
from flask_caching import Cache
import requests
from urllib.parse import quote

from webapp.config import SEARCH_FIELDS


search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)

cache = Cache(config={"CACHE_TYPE": "simple"})

docs_id_cache = {
    "olm": {"id": 1087, "tag": "juju"},
    "sdk": {"id": 4449, "tag": "sdk"},
    "dev": {"id": 6669, "tag": "dev"},
}
url = "https://discourse.charmhub.io"


def map_topic_to_doc(topic):
    for key in docs_id_cache.keys():
        if key in topic["tags"]:
            return docs_id_cache[key]["id"]


def rewrite_topic_url(topics: list) -> list:
    """
    This function takes a list of topics and posts.
    It retrieves navigation details from Discourse and modifies the topic URLs
    based on tag matches. It then adds a url key to each topic dictionary.
    Topics and corresponding Posts without urls are filtered out

    Args:
        topics (list): A list of topic dictionaries
        posts (list): A list of post dictionaries

    Returns:
        dict: A dictionary containing modified lists of posts and topics with
        rewritten URLs.

    Note: it caches navigation table to minimize the number of requests to
    Discourse API

    """
    topics_with_url = []
    for topic in topics:
        index_id = map_topic_to_doc(topic)
        index_details = cache.get(index_id)

        if index_details:
            nav_table = BeautifulSoup(
                index_details["nav_table"], "html.parser"
            )
        else:
            index_page = requests.get(f"{url}/t/{index_id}.json").json()
            index_doc = (
                index_page.get("post_stream").get("posts")[0].get("cooked")
            )
            soup = BeautifulSoup(index_doc, "html.parser")
            nav_heading = soup.find("h2", text="Navigation")
            nav_table = nav_heading.find_next_sibling("details").find("table")
            cache.set(index_id, {"nav_table": str(nav_table)}, timeout=3600)

        topic_link = nav_table.find(
            "a", href=lambda href: href and str(topic["id"]) in href
        )
        if topic_link:
            topic_row_in_nav = topic_link.find_parent("tr")
            topic_data = topic_row_in_nav.find_all("td")
            topic_path = topic_data[1].text
            topic_urls = []
            for tag in topic["tags"]:
                if tag in docs_id_cache.keys():
                    url_tag = docs_id_cache[tag]["tag"]
                    topic_url = f"https://juju.is/docs/{url_tag}/{topic_path}"
                    topic_urls.append(topic_url)
                topic["url"] = topic_urls
            topics_with_url.append(topic)

    return topics_with_url


def search_discourse(
    term: str,
    query: str,
    category: str,
    page: int,
    limit: int,
    see_all: bool,
    filter_topics: callable,
) -> list:
    """
    Searches discourse for topics based on the query parameters.

    Parameters:
        term (str): The search term used to find relevant topics.
        page (int): The page number of the search results to retrieve.
        category (str): The category to search from.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns a limited number of results
        (5 posts and topics).

    Returns:
        dict: A dictionary containing the a list of topics.

    Note:
        This function makes use of a cache to store result for a fetched search
        terms, this helps in reducing redundant requests to the discourse API.
    """
    cached_page = cache.get(f"{category}-{term}")
    result = []
    more_pages = True

    if page == 1 and not see_all:
        pprint("here, limited page 1")
        if cached_page:
            return cached_page.get("topics")[:limit]
        else:
            result = requests.get(
                f"{url}/search.json?q={query}&page={page}"
            ).json()

            topics = filter_topics(result.get("topics", []))
            pprint(limit)
            return topics[:limit]
    if not cached_page:
        # Note: this logic is currently slower than it should ordinarily
        # be because the  discourse API currently has some limitations that
        # would probably be fixed in the near future.
        # The ones affecting this code are:
        # 1. The API does not return any indicator to show if there are more
        #   pages to be fetched.
        # 2. The API does not support fetching multiple categories or
        #   excluding a category from the search
        # 3. The API does not support excluding (we had to filter out archived
        #   topics) a status from the search
        while more_pages:
            result = requests.get(
                f"{url}/search.json?q={query}&page={page}"
            ).json()

            if result.get("topics"):
                topics = filter_topics(result.get("topics", []))
                result.extend(topics)
                next_page = requests.get(
                    f"{url}/search.json?q={query}&page={page+1}"
                ).json()
                if (
                    next_page.get("topics")
                    and next_page.get("topics")[0]["id"]
                    == result.get("topics")[0]["id"]
                ):
                    more_pages = False
                    cache.set(f"{category}-{term}", result, timeout=300)
                    return result[:limit]
                page += 1
            else:
                more_pages = False
                cache.set(f"{category}-{term}", result, timeout=300)
                return result[:limit]

    else:
        result = cached_page
        return result[:limit]


def search_docs(term: str, page: int, limit: int, see_all) -> dict:
    """
    Fetches documentation from discourse from the doc category and
    a specific search term.

    Parameters:
        search_term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns a limited number of results
        (5 posts and topics).

    Returns:
        dict: A dictionary containing the retrieved dtopics.
    """
    categories = ["#doc"]
    encoded_cat = [quote(cat) for cat in categories]
    tags = ["olm", "sdk", "dev"]
    query = f"{term} {' '.join(encoded_cat)} tag:{','.join(tags)}".strip()

    def filter_topics(topics):
        return [topic for topic in topics if not topic["archived"]]

    result = search_discourse(
        term, query, "docs", page, limit, see_all, filter_topics
    )
    topics_with_docs_url = rewrite_topic_url(result)
    return topics_with_docs_url


def search_topics(term: str, page: int, limit: int, see_all=False) -> dict:
    """
    Search discousre for a specific term and return the results.
    It searches from all categories except doc category.

    Parameters:
        search_term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns a limited number of results
        (5 posts and topics).

    Returns:
        dict: A dictionary containing the retrieved topics.
    """
    query = term

    def filter_topics(topics):
        return [
            topic
            for topic in topics
            if not topic["archived"] and topic["category_id"] != 22
        ]

    result = search_discourse(
        term, query, "discourse", page, limit, see_all, filter_topics
    )
    return result


@search.route("/search.json")
def search_home():
    params = request.args
    term = params.get("q")
    types = params.get("types", "")
    pprint(types)
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
                result[type] = valid_types[type](term, 1, False)
            else:
                result[type] = valid_types[type](term, type, limit).get(type)
    else:
        result = {
            "docs": search_docs(term, 1, limit, False),
            "topics": search_topics(term, 1, limit, False),
            "charms": search_charms(term, limit),
            "bundles": search_bundles(term, limit),
        }

    # charmhub.io/search?q=term&types=docs|topics|charms|bundles&type_limit=50&page=1
    return result


def search_charms(term: str, limit: int):
    packages = app.store_api.find(term, fields=SEARCH_FIELDS)
    charms = [
        package
        for package in packages["results"]
        if package["type"] == "charm"
    ]

    return charms[:limit]


def search_bundles(term: str, limit: int):
    packages = app.store_api.find(term, fields=SEARCH_FIELDS)
    bundles = [
        package
        for package in packages["results"]
        if package["type"] == "bundle"
    ]

    return bundles[:limit]


@search.route("/all-charms")
@search.route("/all-bundles")
def all_charms():
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


@search.route("/docs/all")
def all_docs():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("type_limit", 50))

    all_topics = search_docs(search_term, page, True).get("topics")
    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit
    return {"topics": all_topics[start:end], "total_pages": total_pages}


@search.route("/discourse-topics/all")
def all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("type_limit", 50))

    all_topics = search_topics(search_term, page, True).get("topics")
    total_pages = -(len(all_topics) // -limit)
    start = (page - 1) * limit
    end = start + limit
    return {"topics": all_topics[start:end], "total_pages": total_pages}
