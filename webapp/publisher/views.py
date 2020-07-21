from flask import Blueprint
from flask import render_template

from webapp.config import DETAILS_VIEW_REGEX
from webapp.decorators import login_required

publisher = Blueprint(
    "publisher",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)


@publisher.route("/account/details")
@login_required
def get_account_details():

    return render_template("publisher/account-details.html")


@publisher.route("/charms-and-bundles")
@login_required
def charms_and_bundles():

    return render_template("publisher/charms-and-bundles.html")


@publisher.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/listing')
@login_required
def listing(entity_name):
    context = {
        "package_name": entity_name,
        "package_type": "charm",
    }

    return render_template("publisher/listing.html", **context)
