import talisker
from canonicalwebteam.discourse import DiscourseAPI, DocParser, Docs
from canonicalwebteam.search import build_search_view


def init_docs(app, url_prefix):
    discourse_index_id = 3394

    session = talisker.requests.get_session()
    discourse_docs = Docs(
        parser=DocParser(
            api=DiscourseAPI(
                base_url="https://discourse.charmhub.io/", session=session
            ),
            index_topic_id=discourse_index_id,
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
            session=session,
            site="charmhub.io/docs",
            template_path="docs/search.html",
        ),
    )
