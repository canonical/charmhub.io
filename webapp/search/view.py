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


def search_docs(term: str, page: int, see_all=False) -> dict:
    """
    Fetches documentation from discourse based on category and
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

    search_url = f"https://discourse.charmhub.io/search.json?q={query}"

    resp = {}
    cached_page = cache.get(f"{term}_{page}")
    if not cached_page:
        docs = requests.get(f"{search_url}&page={page}").json()

        if not docs.get("topics"):
            return {"error": "No results found"}

        # filter out archived topics
        topics = [
            topic for topic in docs.get("topics") if not topic["archived"]
        ]

        resp["topics"] = rewrite_topic_url(topics)
        cache.set(f"{term}_{page}", resp, timeout=600)  # 10 min cache
    else:
        resp = cached_page
    if page == 1 and not see_all:
        return {"topics": resp["topics"][:5]}

    return resp


def get_all(doc_type: str, search_term: str, page: int) -> dict:
    """
    Returns paginated documentation of a specific type(post or topic) from the
    charmhub.io discourse.

    Parameters:
        doc_type (str): type of documentation to fetch ("posts" or "topics").
        search_term (str): The search term used to find relevant documentation.
        page (int): The page number of the search results to retrieve.

    Returns:
        dict: A dictionary containing the paginated documentation of the
        specified type.
            - If there are no results found for the provided `search_term`,
                the dictionary will contain an "error" key
                with the value "No results found", and a 404 status code will
                be returned.
            - If there are results, the dictionary will contain the paginated
                requested `doc_type` (e.g., "posts" or "topics") and the total
                pages

    Note:
        The function internally calls the `get_docs` function to retrieve the
        documentation.
    """
    see_all = True
    count = 10
    page = page

    doc_page = -((count * page) // -50)
    docs = get_docs(search_term, page=doc_page, see_all=see_all)
    if "error" not in docs:
        all = docs.get(doc_type, [])
        end = page * count
        start = end - count
        if start >= len(all):
            end = len(all)
            start = end - count
        # to do: find a way of calculating total pages
        posts_per_page = {
            doc_type: all[start:end],
        }

        return make_response(posts_per_page, 200)
    else:
        return make_response({"error": "No results found"}, 404)


@search.route("/docs")
def docs_search():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    docs = get_docs(search_term, page)
    return docs


@search.route("/docs/all-topics")
def get_all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    return get_all("topics", search_term, page)
