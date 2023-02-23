import talisker
from flask import Blueprint, render_template
from flask import current_app as app
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from webapp.topics.views import topic_list
from webapp.config import CATEGORIES, SEARCH_FIELDS
from webapp.store.logic import add_store_front_data

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static"
)
publisher_api = CharmPublisher(talisker.requests.get_session())

# to be aligned in store base, oold code used for now
@store.route("/store")
def index():
    featured_charms = app.store_api.find(
        category="featured", fields=SEARCH_FIELDS
    )["results"]
    featured_topics = [t for t in topic_list if "featured" in t["categories"]]

    context = {
        "categories": CATEGORIES,
        "featured_topics": featured_topics,
    }

    featured_packages = []

    for i, item in enumerate(featured_charms):
        # add_store_front_data will be refactored for the new app
        charm = add_store_front_data(featured_charms[i], False)
        featured_packages.append(charm)

    context["featured_charms"] = featured_packages

    return render_template("store.html", **context)
