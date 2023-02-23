from flask import Blueprint, render_template, request, session
import talisker
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from webapp.decorators import login_required


publisher = Blueprint(
    "publisher",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)

publisher_api = CharmPublisher(talisker.requests.get_session())

@publisher.route("/account/details")
@login_required
def account_details():
    return render_template("publisher/account-details.html")

# this route should be aligned in store base. Just showing the old one for now
@publisher.route("/charms")
@publisher.route("/bundles")
@login_required
def list_page():

    publisher_charms = publisher_api.get_account_packages(
        session["account-auth"], "charm", include_collaborations=True
    )

    page_type = request.path[1:-1]

    context = {
        "published": [
            c
            for c in publisher_charms
            if c["status"] == "published" and c["type"] == page_type
        ],
        "registered": [
            c
            for c in publisher_charms
            if c["status"] == "registered" and c["type"] == page_type
        ],
        "page_type": page_type,
    }

    return render_template("publisher/list.html", **context)