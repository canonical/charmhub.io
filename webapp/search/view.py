from flask import Blueprint, request, make_response
import requests
from flask_caching import Cache

search = Blueprint(
    "search", __name__, template_folder="/templates", static_folder="/static"
)

cache = Cache(config={"CACHE_TYPE": "simple"})


def get_docs(search_term: str, page: int, see_all=False):
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
    query = f"{search_term} {' '.join(categories)}".strip()
    resp = {}
    term = cache.get(search_term)

    more_pages = True
    docs = {}
    if not term:
        # clear cache of any previously saved search term
        cache.clear()
        while more_pages:
            docs = requests.get(
                f"https://discourse.charmhub.io/search.json?q={query}"
                "&page={page}"
            ).json()

            if not docs.get("posts") and not docs.get("topics"):
                return {"error": "No results found"}

            if "posts" in resp:
                resp["posts"].append(docs.get("posts", []))
            else:
                resp["posts"] = docs.get("posts", [])
            if "topics" in resp:
                resp["topics"].append(docs.get("topics", []))
            else:
                resp["topics"] = docs.get("topics", [])

            next_docs = requests.get(
                f"https://discourse.charmhub.io/search.json?q={query}"
                "&page={page + 1}"
            ).json()
            if (
                docs["posts"][0]["id"] == next_docs["posts"][0]["id"]
                and docs["topics"][0]["id"] == next_docs["topics"][0]["id"]
            ):
                more_pages = False
                cache.set(search_term, resp)
                if not see_all:
                    resp["posts"] = docs.get("posts", [])[0:4]
                    resp["topics"] = docs.get("topics", [])[0:4]
                    return resp
                return resp
            else:
                page += 1
                resp["posts"].append(next_docs.get("posts", []))
                resp["topics"].append(next_docs.get("topics", []))
                docs = next_docs
    else:
        if not see_all:
            resp["posts"] = term.get("posts", [])[0:4]
            resp["topics"] = term.get("topics", [])[0:4]
            return resp
        resp["posts"] = term.get("posts", [])
        resp["topics"] = term.get("topics", [])
        return resp


def get_all(doc_type: str, search_term: str, page: int):
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
        all_post = docs.get("posts", [])
        end = page * count
        start = end - count
        if start >= len(all_post):
            end = len(all_post)
            start = end - count
        total_pages = -(len(all_post) // -count)
        posts_per_page = {
            doc_type: all_post[start:end],
            "total_pages": total_pages,
        }

        return make_response(posts_per_page, 200)
    else:
        return make_response({"error": "No results found"}, 404)


@search.route("/docs")
def docs_search():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    docs = get_docs(search_term, page=page)
    return make_response(docs, 200)


@search.route("/docs/all-posts")
def get_all_posts():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    return get_all("posts", search_term, page)


@search.route("/docs/all-topics")
def get_all_topics():
    search_term = request.args.get("q")
    page = int(request.args.get("page", 1))
    return get_all("topics", search_term, page)
