from flask_caching import Cache


import requests
from webapp.config import SEARCH_FIELDS
from webapp.packages.logic import parse_package_for_card
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway

DISCOURSE_URL = "https://discourse.charmhub.io"
DOCS_URL = "https://canonical-juju.readthedocs-hosted.com/"

cache = Cache(config={"CACHE_TYPE": "simple"})


@trace_function
def search_discourse(
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
    cached_page = cache.get(f"{query}-{page}")

    if not see_all:
        if cached_page:
            return cached_page
        else:
            resp = requests.get(
                f"{DISCOURSE_URL}/search.json?q={query}&page={page}"
            )
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
            cache.set(f"{query}-{page}", topics, timeout=300)
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
        cached_page = cache.get(f"{query}-{page}")
        if cached_page:
            result.extend(cached_page)
            page += 1
            continue

        resp = requests.get(
            f"{DISCOURSE_URL}/search.json?q={query}&page={page}"
        )
        data = resp.json()
        topics = data.get("topics", [])

        if topics:
            for topic in topics:
                post = next(
                    (
                        post
                        for post in data["posts"]
                        if post["topic_id"] == topic["id"]
                    ),
                    None,
                )
                topic["post"] = post
            cache.set(f"{query}-{page}", topics, timeout=300)
            result.extend(topics)
            page += 1
            next_resp = requests.get(
                f"{DISCOURSE_URL}/search.json?q={query}&page={page}"
            )
            next_topics = next_resp.json().get("topics", [])
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

    search_url = (
        f"{DOCS_URL}/_/api/v3/search/?q=project%3Acanonical-juju+{term}"
    )

    resp = requests.get(search_url)
    data = resp.json()

    results = data.get("results", [])

    return results


@trace_function
def search_topics(term: str, page: int, see_all=False) -> dict:
    """
    Search discousre for a specific term and return the results.
    It searches from all categories except doc category.

    Parameters:
        term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns the first page only

    Returns:
        dict: A dictionary containing the retrieved topics.
    """
    query = term

    result = search_discourse(query, page, see_all)

    result = [topic for topic in result if topic["category_id"] != 22]

    return result


@trace_function
def search_charms(term: str):
    return [
        parse_package_for_card(package)
        for package in publisher_gateway.find(
            term, type="charm", fields=SEARCH_FIELDS
        )["results"]
    ]


@trace_function
def search_bundles(term: str):
    return [
        parse_package_for_card(package)
        for package in publisher_gateway.find(
            term, type="bundle", fields=SEARCH_FIELDS
        )["results"]
    ]
