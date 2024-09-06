from flask import current_app as app
from bs4 import BeautifulSoup
from flask_caching import Cache
import requests
from urllib.parse import quote
from typing import Dict
from webapp.config import SEARCH_FIELDS
from webapp.packages.logic import parse_package_for_card
from webapp.packages.store_packages import CharmStore, CharmPublisher


url = "https://discourse.charmhub.io"
docs_id_cache = {
    "olm": {"id": 1087, "tag": "juju"},
    "sdk": {"id": 4449, "tag": "sdk"},
    "dev": {"id": 6669, "tag": "dev"},
}

# This stores all the mappings from topic index to the
# corresponding url in the documentation
documentation_topic_mappings: Dict[int, str] = {}


def fetch_documentation_index():
    """
    This function initializes the cache dict for the navigation table
    of the documentation index. It fetches the navigation table
    from the discourse API and stores all the entries in a dictionary
    where the key is the topic id and the value is the corresponding
    url in the documentation.
    """
    for key in docs_id_cache.keys():
        index_id = docs_id_cache[key]["id"]
        index_page = requests.get(f"{url}/t/{index_id}.json").json()

        index_doc = index_page.get("post_stream").get("posts")[0].get("cooked")

        soup = BeautifulSoup(index_doc, "html.parser")
        details_element = soup.find(
            lambda tag: tag.name == "details"
            and "Navigation" in tag.summary.text
        )

        if details_element:
            table = details_element.find("table")
            if table:
                rows = table.find_all("tr")[1:]
                for row in rows:
                    cells = row.find_all("td")
                    if len(cells) == 3:
                        path = cells[1].text.strip()
                        if not path:
                            continue
                        url_tag = docs_id_cache[key]["tag"]
                        topic_link = cells[2].find("a")
                        if topic_link:
                            topic_id = topic_link["href"].split("/")[-1]
                            documentation_topic_mappings[topic_id] = (
                                f"https://juju.is/docs/{url_tag}/{path}"
                            )


cache = Cache(config={"CACHE_TYPE": "simple"})


def rewrite_topic_url(topics: list) -> list:
    if len(documentation_topic_mappings) == 0:
        fetch_documentation_index()
    for topic in topics:
        topic["url"] = documentation_topic_mappings.get(str(topic["id"]))

    return topics


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
            resp = requests.get(f"{url}/search.json?q={query}&page={page}")
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

        resp = requests.get(f"{url}/search.json?q={query}&page={page}")
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
                f"{url}/search.json?q={query}&page={page}"
            )
            next_topics = next_resp.json().get("topics", [])
            if not next_topics or next_topics[0]["id"] == topics[0]["id"]:
                more_pages = False
        else:
            more_pages = False

    return result


def search_docs(term: str, page: int, see_all: bool = False) -> dict:
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
    encoded_categories = [quote(cat) for cat in categories]
    tags = ["olm", "sdk", "dev"]
    query = (
        f"{term} {' '.join(encoded_categories)} tag:{','.join(tags)}".strip()
    )

    # exclude archived
    query += " status:-archived"

    result = search_discourse(query, page, see_all)

    return rewrite_topic_url(result)


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


def search_charms(term: str):
    return [
        parse_package_for_card(package, CharmStore, CharmPublisher)
        for package in app.store_api.find(
            term, type="charm", fields=SEARCH_FIELDS
        )["results"]
    ]


def search_bundles(term: str):
    return [
        parse_package_for_card(package, CharmStore, CharmPublisher)
        for package in app.store_api.find(
            term, type="bundle", fields=SEARCH_FIELDS
        )["results"]
    ]
