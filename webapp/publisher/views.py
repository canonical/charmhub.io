import talisker
from flask import Blueprint, render_template, session

from canonicalwebteam.store_api.stores.charmstore import CharmPublisher

from webapp.helpers import get_licenses
from webapp.config import DETAILS_VIEW_REGEX
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
def get_account_details():
    return render_template("publisher/account-details.html")


@publisher.route("/charms")
@login_required
def charms():
    publisher_charms = publisher_api.get_account_packages(
        session["publisher-auth"], "charm"
    )

    context = {
        "published": [
            c for c in publisher_charms if c["status"] == "published"
        ],
        "registered": [
            c for c in publisher_charms if c["status"] == "registered"
        ],
    }

    return render_template("publisher/charms.html", **context)


@publisher.route("/bundles")
@login_required
def bundles():
    return render_template("publisher/bundles.html")


@publisher.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/listing')
@login_required
def listing(entity_name):
    package = publisher_api.get_package_metadata(
        session["publisher-auth"], "charm", entity_name
    )

    licenses = []
    for license in get_licenses():
        licenses.append({"key": license["licenseId"], "name": license["name"]})

    context = {
        "package": package,
        "licenses": licenses,
    }
    return render_template("publisher/listing.html", **context)


@publisher.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/settings')
@login_required
def settings(entity_name):
    context = {
        "package_name": entity_name,
        "package_type": "charm",
    }

    return render_template("publisher/settings.html", **context)
