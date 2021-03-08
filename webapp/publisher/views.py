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
@publisher.route("/bundles")
@login_required
def list_page():
    publisher_charms = publisher_api.get_account_packages(
        session["publisher-auth"], "charm"
    )

    page_type = request.path[1:]

    context = {
        "published": [
            c for c in publisher_charms if c["status"] == "published"
        ],
        "registered": [
            c for c in publisher_charms if c["status"] == "registered"
        ],
        "page_type": page_type,
    }

    return render_template("publisher/list.html", **context)


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


@publisher.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/publicise'
)
@login_required
def get_publicise(entity_name):
    SUPPORTED_LANGUAGES = {
        "ar": {"title": "العربية", "text": "احصل عليه من Charmhub"},
        "bg": {"title": "български", "text": "Инсталирайте го от Charmhub"},
        "bn": {"title": "বাংলা", "text": "Charmhub থেকে ইনস্টল করুন"},
        "de": {"title": "Deutsch", "text": "Installieren vom Charmhub"},
        "en": {"title": "English", "text": "Get it from the Charmhub"},
        "es": {"title": "Español", "text": "Instalar desde Charmhub"},
        "fr": {
            "title": "Français",
            "text": "Installer à partir du Charmhub",
        },
        "it": {"title": "Italiano", "text": "Scarica dallo Charmhub"},
        "jp": {"title": "日本語", "text": "Charmhub から入手ください"},
        "pl": {"title": "Polski", "text": "Pobierz w Charmhub"},
        "pt": {"title": "Português", "text": "Disponível na Charmhub"},
        "ro": {"title": "Română", "text": "Instalează din Charmhub"},
        "ru": {"title": "русский язык", "text": "Загрузите из Charmhub"},
        "tw": {"title": "中文（台灣）", "text": "安裝軟體敬請移駕 Charmhub"},
        "ua": {"title": "українськa мовa", "text": "Завантажте з Charmhub"},
    }
    package = publisher_api.get_package_metadata(
        session["publisher-auth"], "charm", entity_name
    )

    context = {
        "package": package,
        "languages": SUPPORTED_LANGUAGES,
    }
    return render_template("publisher/publicise/store_buttons.html", **context)


@publisher.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/publicise/badges'
)
@login_required
def get_publicise_badges(entity_name):
    package = publisher_api.get_package_metadata(
        session["publisher-auth"], "charm", entity_name
    )

    context = {
        "package": package,
    }
    return render_template("publisher/publicise/github_badges.html", **context)


@publisher.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/publicise/cards'
)
@login_required
def get_publicise_cards(entity_name):
    package = publisher_api.get_package_metadata(
        session["publisher-auth"], "charm", entity_name
    )

    context = {
        "package": package,
    }
    return render_template(
        "publisher/publicise/embedded_cards.html", **context
    )
