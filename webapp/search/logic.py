from flask import current_app as app
from bs4 import BeautifulSoup
from flask_caching import Cache
import requests
from urllib.parse import quote

from webapp.config import SEARCH_FIELDS


url = "https://discourse.charmhub.io"
docs_id_cache = {
    "olm": {"id": 1087, "tag": "juju"},
    "sdk": {"id": 4449, "tag": "sdk"},
    "dev": {"id": 6669, "tag": "dev"},
}

cache = Cache(config={"CACHE_TYPE": "simple"})


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
        nav_table = None

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

            if nav_heading:
                nav_table = nav_heading.find_next_sibling("details").find(
                    "table"
                )

            if nav_table:
                cache.set(
                    index_id, {"nav_table": str(nav_table)}, timeout=3600
                )

        if nav_table:
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
                        topic_url = (
                            f"https://juju.is/docs/{url_tag}/{topic_path}"
                        )
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
        if cached_page:
            return cached_page.get("topics")[:limit]
        else:
            resp = requests.get(
                f"{url}/search.json?q={query}&page={page}"
            ).json()

            topics = filter_topics(resp.get("topics", []))
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
            resp = None
            if len(result) < 10:
                resp = (
                    requests.get(f"{url}/search.json?q={query}&page={page}")
                    .json()
                    .get("topics", [])
                )
            if resp:
                topics = filter_topics(resp)
                result.extend(topics)
                next_page = requests.get(
                    f"{url}/search.json?q={query}&page={page+1}"
                ).json()
                if (
                    next_page.get("topics")
                    and next_page.get("topics")[0]["id"] == resp[0]["id"]
                ):
                    more_pages = False
                    cache.set(f"{category}-{term}", result, timeout=300)
                    return result
                page += 1
            else:
                more_pages = False
                cache.set(f"{category}-{term}", result, timeout=300)
                return result

    else:
        result = cached_page
        return result


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
        return rewrite_topic_url(
            [topic for topic in topics if not topic["archived"]]
        )

    result = search_discourse(
        term, query, "docs", page, limit, see_all, filter_topics
    )

    return result


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
