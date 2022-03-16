import json
from os import getenv

from canonicalwebteam.discourse import DocParser
from canonicalwebteam.discourse.exceptions import (
    PathNotFoundError,
    RedirectFoundError,
)
from flask import Blueprint, abort, render_template, request, redirect
from webapp.helpers import discourse_api
from jinja2 import Template
from bs4 import BeautifulSoup

from webapp.config import CATEGORIES

DISCOURSE_API_KEY = getenv("DISCOURSE_API_KEY")
DISCOURSE_API_USERNAME = getenv("DISCOURSE_API_USERNAME")

topics = Blueprint(
    "topics", __name__, template_folder="/templates", static_folder="/static"
)

with open("webapp/topics/topics.json") as f:
    topic_list = json.load(f)


class TopicParser(DocParser):
    def parse_topic(self, topic, docs_version=""):
        result = super().parse_topic(topic, docs_version)

        soup = BeautifulSoup(result["body_html"], features="html.parser")
        self._parse_packages(soup)
        result["body_html"] = soup
        return result

    def _parse_packages(self, soup):
        """
        Get a list of packages from all the
        packages tables in a topic

        Example:
        | Charms |
        | -- |
        | https://charmhub.io/hello-kubecon |
        """
        package_tables = []

        tables = soup.select("table:has(th:-soup-contains('Charms'))")

        for table in tables:
            table_rows = table.select("tr:has(td)")

            if table_rows:
                packages_set = {"soup_table": table, "packages": []}

                # Get all packages URLs in this table
                for row in table_rows:
                    navlink_href = row.find("a", href=True)

                    if navlink_href:
                        navlink_href = navlink_href.get("href")

                        if not navlink_href.startswith("https://charmhub.io"):
                            self.warnings.append("Invalid tutorial URL")
                            continue

                        # To avoid iframe issues with local development, demos
                        navlink_href = navlink_href.replace(
                            "https://charmhub.io/", request.url_root
                        )

                        packages_set["packages"].append(navlink_href)

                package_tables.append(packages_set)

        if package_tables:
            # Remplace tables with cards
            self._replace_packages(package_tables)

    def _replace_packages(self, package_tables):
        """
        Replace charm tables to cards
        """
        card_template = Template(
            (
                '<div class="row">'
                "{% for package in packages %}"
                '<div class="col-small-5 col-medium-3 col-3">'
                '<iframe src="{{ package }}/embedded?store_design=true" '
                'frameborder="0" width="266px" height="266px" '
                'style="border: 0"></iframe>'
                "</div>"
                "{% endfor %}"
                "</div>"
            )
        )

        for table in package_tables:
            card = card_template.render(
                packages=table["packages"],
            )
            table["soup_table"].replace_with(
                BeautifulSoup(card, features="html.parser")
            )


@topics.route("/topics.json")
def topics_json():
    query = request.args.get("q", default=None, type=str)

    if query:
        query = query.lower()
        results = []

        for t in topic_list:
            if query in t["name"].lower() or query in t["categories"]:
                results.append(t)
    else:
        results = topic_list

    return {
        "topics": results,
        "q": query,
        "size": len(results),
    }


@topics.route("/topics")
def all_topics():
    context = {}
    context["topics"] = topic_list
    context["categories"] = CATEGORIES
    return render_template("topics/index.html", **context)


@topics.route("/topics/<string:topic_slug>")
@topics.route("/topics/<string:topic_slug>/<path:path>")
def topic_page(topic_slug, path=None):
    topic = next((t for t in topic_list if t["slug"] == topic_slug), None)

    if not topic:
        return abort(404)

    topic_id = topic["topic_id"]
    docs_url_prefix = f"/topics/{topic_slug}"

    docs = TopicParser(
        api=discourse_api,
        index_topic_id=topic_id,
        url_prefix=docs_url_prefix,
        tutorials_index_topic_id=2628,
        tutorials_url_prefix="https://juju.is/tutorials",
    )
    docs.parse()

    if path:
        try:
            topic_id = docs.resolve_path(path)[0]
        except PathNotFoundError:
            abort(404)
        except RedirectFoundError as path_redirect:
            return redirect(path_redirect.target_url)

        topic = docs.api.get_topic(topic_id)
    else:
        topic = docs.index_topic

    document = docs.parse_topic(topic)

    context = {
        "navigation": docs.navigation,
        "forum_url": docs.api.base_url,
        "document": document,
    }

    return render_template("topics/document.html", **context)
