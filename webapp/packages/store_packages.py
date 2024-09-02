import talisker
from webapp.decorators import login_required
from flask import (
    Blueprint,
    request,
    session,
    make_response,
)

from webapp.packages.logic import (
    get_packages,
    get_package,
)
from webapp.config import SEARCH_FIELDS as FIELDS

from canonicalwebteam.store_api.stores.charmstore import (
    CharmStore,
    CharmPublisher,
)


store_packages = Blueprint(
    "package",
    __name__,
)


@store_packages.route("/store.json")
def get_store_packages():
    args = dict(request.args)
    libraries = bool(args.pop("fields", ""))
    res = make_response(
        get_packages(
            CharmStore,
            CharmPublisher,
            libraries,
            FIELDS,
            12,
            args,
        )
    )
    return res


@store_packages.route("/<any(charms, bundles):package_type>")
@login_required
def package(package_type):
    """
    Retrieves and returns package information based on the current app
    and package type.

    :returns: Response: The HTTP response containing the JSON data of the
    packages.
    """

    publisher_api = CharmPublisher(talisker.requests.get_session())

    publisher_packages = publisher_api.get_account_packages(
        session["account-auth"], "charm", include_collaborations=True
    )
    page_type = request.path[1:-1]

    response = make_response(
        {
            "published_packages": [
                package
                for package in publisher_packages
                if package["status"] == "published"
                and package["type"] == page_type
            ],
            "registered_packages": [
                package
                for package in publisher_packages
                if package["status"] == "registered"
                and package["type"] == page_type
            ],
            "page_type": page_type,
        }
    )
    return response


@store_packages.route("/<package_name>/card.json")
def get_store_package(package_name):

    has_libraries = bool(request.args.get("fields", ""))

    res = make_response(
        get_package(
            CharmStore,
            CharmPublisher,
            package_name,
            FIELDS,
            has_libraries,
        )
    )
    return res
