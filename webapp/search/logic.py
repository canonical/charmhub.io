import requests

from redis_cache.cache_utility import redis_cache
from webapp.config import SEARCH_FIELDS
from webapp.packages.logic import parse_package_for_card
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway

DISCOURSE_URL = "https://discourse.charmhub.io"
DOCS_URL = "https://canonical-juju.readthedocs-hosted.com/"


@trace_function
def search_topics(
    query: str,
    page: int = 1,
    see_all: bool = False,
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
        list: A list containing the a list of topics.

    Note:
        This function makes use of a cache to store result for a fetched search
        terms, this helps in reducing redundant requests to the discourse API.
    """
    key = ("search-topics", {"q": query, "pg": page})
    cached_page = redis_cache.get(key, expected_type=list)

    if not see_all:
        if cached_page:
            return cached_page
        else:
            resp = requests.get(f"{DISCOURSE_URL}/search.json?q={query}&page={page}")
            topics = resp.json().get("topics", [])
            for topic in topics:
                post = next(
                    (
                        post
                        for post in resp.json()["posts"]
                        if post["topic_id"] == topic["id"]
                    ),
                    None,
                )
                topic["post"] = post
            topics = [topic for topic in topics if topic["category_id"] != 22]
            redis_cache.set(key, topics, ttl=3600)
            return topics

    # Note: this logic is currently slower than it should ordinarily
    # be because the  discourse API currently has some limitations that
    # would probably be fixed in the near future.
    # The ones affecting this code are:
    # 1. The API does not return any indicator to show if there are more
    #   pages to be fetched.
    # 2. The API does not support fetching multiple categories or
    #   excluding a category from the search

    result = []
    more_pages = True

    while more_pages:
        key = ("search-topics", {"q": query, "pg": page})
        cached_page = redis_cache.get(key, expected_type=list)
        if cached_page:
            result.extend(cached_page)
            page += 1
            continue

        resp = requests.get(f"{DISCOURSE_URL}/search.json?q={query}&page={page}")
        data = resp.json()
        topics = data.get("topics", [])

        if topics:
            for topic in topics:
                post = next(
                    (post for post in data["posts"] if post["topic_id"] == topic["id"]),
                    None,
                )
                topic["post"] = post
            redis_cache.set(key, topics, ttl=3600)
            result.extend(topics)
            page += 1
            key = ("search-topics", {"q": query, "pg": page})

            cached_next_topics = redis_cache.get(key, expected_type=list)
            if cached_next_topics:
                next_topics = cached_next_topics
            else:
                next_resp = requests.get(
                    f"{DISCOURSE_URL}/search.json?q={query}&page={page}"
                )
                next_topics = [
                    topic
                    for topic in next_resp.json().get("topics", [])
                    if topic["category_id"] != 22
                ]
                redis_cache.set(key, next_topics, ttl=3600)
            if not next_topics or next_topics[0]["id"] == topics[0]["id"]:
                more_pages = False
        else:
            more_pages = False

    return result


@trace_function
def search_docs(term: str) -> dict:
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
    key = ("search-docs", {"q": term})
    results = redis_cache.get(key, expected_type=list)
    if results:
        return results
    search_url = f"{DOCS_URL}/_/api/v3/search/?q=project%3Acanonical-juju+{term}"

    resp = requests.get(search_url)
    data = resp.json()

    results = data.get("results", [])
    redis_cache.set(key, results, ttl=3600)

    return results


@trace_function
def search_charms(term: str):
    key = ("search-charms", {"q": term})
    charms = redis_cache.get(key, expected_type=list)
    if charms:
        return charms
    charms = [
        parse_package_for_card(package)
        for package in publisher_gateway.find(term, type="charm", fields=SEARCH_FIELDS)[
            "results"
        ]
    ]
    redis_cache.set(key, charms, ttl=3600)
    return charms


@trace_function
def search_bundles(term: str):
    key = ("search-bundles", {"q": term})
    bundles = redis_cache.get(key, expected_type=list)
    if bundles:
        return bundles
    bundles = [
        parse_package_for_card(package)
        for package in publisher_gateway.find(
            term, type="bundle", fields=SEARCH_FIELDS
        )["results"]
    ]
    redis_cache.set(key, bundles, ttl=3600)
    return bundles
