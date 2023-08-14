from pprint import pprint
from bs4 import BeautifulSoup
from flask import Blueprint, request, make_response
from flask_caching import Cache
import requests
from urllib.parse import quote


search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)

cache = Cache(config={"CACHE_TYPE": "simple"})

docs_id_cache = {
    "olm": {"id": 1087, "tag": "juju"},
    "sdk": {"id": 4449, "tag": "sdk"},
    "dev": {"id": 6669, "tag": "dev"},
}


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
            index_page = requests.get(
                f"https://discourse.charmhub.io/t/{index_id}.json"
            ).json()
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


def search_discourse(term: str, query: str, category: str, page: int, see_all) -> dict:
    cached_page = cache.get(f"{category}-{term}-{page}")

    if not cached_page:
        result = requests.get(
            f"https://discourse.charmhub.io/search.json?q={query}&page={page}"
        ).json()

        # filter out archived topics
        topics = [
            topic
            for topic in result.get("topics")
            if not topic["archived"]
        ]
        cache.set(f"{category}-{term}-{page}", topics, timeout=600)
    else:
        topics = cached_page
    if page == 1 and not see_all:
        return {"topics": topics[:5]}
    return {"topics": topics}


def search_docs(term: str, page: int, see_all)-> dict:
    """
    Fetches documentation from discourse from the doc category and
    a specific search term.

    Parameters:
        search_term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns a limited number of results
        (4 posts and topics).

    Returns:
        dict: A dictionary containing the retrieved documentation.
            - If there are no results found, the dictionary will contain an
                "error" key with the value "No results found".
            - If `see_all` is True, the dictionary will contain all the
                available posts and topics.
            - If `see_all` is False the dictionary will contain only 4 posts
                and topics.

    Note:
        This function makes use of a cache to store result for a fetched search
        terms, it clears cache when another term is searched and this helps in
        reducing redundant requests to the charmhub.io discourse API.
    """
    categories = ["#doc"]
    encoded_cat = [quote(cat) for cat in categories]
    tags = ["olm", "sdk", "dev"]
    query = f"{term} {' '.join(encoded_cat)} tag:{','.join(tags)}".strip()
    cached_page = cache.get(f"docs-{term}")
    docs = {"topics": []}
    more_pages = True

    if page == 1 and not see_all:
        if cached_page:
            return {"topics": cached_page[:5]}
        else:
            result = requests.get(
                f"https://discourse.charmhub.io/search.json?q={query}&page={page}"
            ).json()
            topics = [
                topic
                for topic in result.get("topics")
                if not topic["archived"]
            ]
            return {"topics": topics[:5]}
    if not cached_page:
        while more_pages:
            result = requests.get(
                f"https://discourse.charmhub.io/search.json?q={query}&page={page}"
            ).json()

            # filter out archived topics
            if result.get("topics"):
                topics = [
                    topic
                    for topic in result.get("topics")
                    if not topic["archived"]
                ]
                docs["topics"].extend(topics)
                # check if there are more search pages
                next_page = requests.get(
                    f"https://discourse.charmhub.io/search.json?q={query}&page={page+1}"
                ).json()
                if (
                    next_page.get("topics")
                    and next_page.get("topics")[0]["id"] == result.get("topics")[0]["id"]
                ):
                    # no more pages
                    # return topics, and save in cache
                    more_pages = False
                    cache.set(f"docs-{term}", docs, timeout=600)
                    pprint(len(docs["topics"]))
                    return docs
                page += 1
            else:
                # no more pages
                # return topics, and save in cache
                more_pages = False
                cache.set(f"docs-{term}", docs, timeout=600)
                pprint(len(docs["topics"]))
                return docs

    else:
        docs = cached_page
        return docs


def search_topics(term: str, page: int, see_all=False) -> dict:
    """
    Search discousre for a specific term and return the results.
    It searches from all categories apart from doc category.

    Parameters:
        search_term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.
        see_all (bool, optional): If True, retrieves all available search
        results. If False (default), returns a limited number of results
        (4 posts and topics).

    Returns:
        dict: A dictionary containing the retrieved documentation.
            - If there are no results found, the dictionary will contain an
                "error" key with the value "No results found".
            - If `see_all` is True, the dictionary will contain all the
                available posts and topics.
            - If `see_all` is False the dictionary will contain only 4 posts
                and topics.
    """

    query = term.strip()

    discourse_result = search_discourse(
        term, query, "discourse", page, see_all
    )
    # topics = [
    #     topic
    #     for topic in discourse_result["topics"]
    #     if topic["category_id"] != 22 and not topic["archived"]
    # ]
    # return {"topics": topics}
    return discourse_result


@search.route("/docs")
def docs():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))

    docs = search_docs(search_term, page, False)
    return docs


@search.route("/docs/all")
def all_docs():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))

    all_topics = search_docs(search_term, page, True).get("topics")
    pprint({"all": len(all_topics)})
    count = 50
    total_pages = -(len(all_topics) // -count)
    start = (page - 1) * count
    end = start + count
    return {"topics": all_topics[start:end], "total_pages": total_pages}


@search.route("/discourse-topics")
def topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))

    topics = search_topics(search_term, page, False)
    return topics


@search.route("/discourse-topics/all")
def all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))

    topics = search_topics(search_term, page, True)
    return topics
