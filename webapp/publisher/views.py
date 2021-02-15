import talisker
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from flask import (
    Blueprint,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from webapp.config import DETAILS_VIEW_REGEX
from webapp.decorators import login_required
from webapp.helpers import get_licenses

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


@publisher.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/listing',
    methods=["POST"],
)
@login_required
def post_listing(entity_name):
    # These are the available fields to update in API
    data = {
        "contact": request.form["contact"],
        "summary": request.form["summary"],
        "title": request.form["title"],
        "website": request.form["website"],
    }

    result = publisher_api.update_package_metadata(
        session["publisher-auth"], "charm", entity_name, data
    )

    if result:
        flash("Changes applied successfully.", "positive")

    return redirect(url_for(".listing", entity_name=entity_name))


@publisher.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/settings')
@login_required
def settings(entity_name):
    package = publisher_api.get_package_metadata(
        session["publisher-auth"], "charm", entity_name
    )

    context = {
        "package": package,
    }

    return render_template("publisher/settings.html", **context)


@publisher.route("/register-name")
@login_required
def register_name():

    return render_template("publisher/register-name.html")


@publisher.route("/register-name-dispute")
@login_required
def register_name_dispute():
    entity_name = request.args.get("entity-name", type=str)

    if not entity_name:
        return redirect(url_for(".register_name", entity_name=entity_name))

    return render_template(
        "publisher/register-name-dispute/index.html", entity_name=entity_name
    )


@publisher.route("/register-name-dispute/thank-you")
@login_required
def register_name_dispute_thank_you():
    entity_name = request.args.get("entity-name", type=str)

    if not entity_name:
        return redirect(url_for(".register_name", entity_name=entity_name))

    return render_template(
        "publisher/register-name-dispute/thank-you.html",
        entity_name=entity_name,
    )
