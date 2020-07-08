import talisker

from canonicalwebteam.discourse_docs import (
    DiscourseAPI,
    DiscourseDocs,
    DocParser,
)

from canonicalwebteam.search import build_search_view


def init_docs(app, url_prefix):
    discourse_index_id = 1087
    category_id = 22

    session = talisker.requests.get_session()
    discourse_docs = DiscourseDocs(
        parser=DocParser(
            api=DiscourseAPI(
                base_url="https://discourse.juju.is/", session=session
            ),
            index_topic_id=discourse_index_id,
            category_id=category_id,
            url_prefix=url_prefix,
        ),
        document_template="docs/document.html",
        url_prefix=url_prefix,
    )

    discourse_docs.init_app(app)

    app.add_url_rule(
        "/docs/search",
        "docs-search",
        build_search_view(
            site="juju.is/docs", template_path="docs/search.html"
        ),
    )
