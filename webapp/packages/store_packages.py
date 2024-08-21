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
from webapp.config import APP_NAME

from canonicalwebteam.store_api.stores.charmstore import (
    CharmStore,
    CharmPublisher,
)

charmhub_config = {
    "store": CharmStore,
    "publisher": CharmPublisher,
    "fields": [
        "result.categories",
        "result.summary",
        "result.media",
        "result.title",
        "result.publisher.display-name",
        "default-release.revision.revision",
        "default-release.channel",
        "result.deployable-on",
    ],
    "permissions": [
        "account-register-package",
        "account-view-packages",
        "package-manage",
        "package-view",
    ],
    "size": 12,
}


store_packages = Blueprint(
    "package",
    __name__,
)


@store_packages.route("/store.json")
def get_store_packages():
    args = dict(request.args)
    libraries = bool(args.pop("fields", ""))
    params = charmhub_config
    store, publisher, fields, size = (
        params["store"],
        params["publisher"],
        params["fields"],
        params["size"],
    )

    res = make_response(
        get_packages(store, publisher, APP_NAME, libraries, fields, size, args)
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

    publisher = charmhub_config["publisher"]

    publisher_api = publisher(talisker.requests.get_session())

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
    params = charmhub_config
    store, publisher, fields = (
        params["store"],
        params["publisher"],
        params["fields"],
    )

    res = make_response(
        get_package(
            store, publisher, APP_NAME, package_name, fields, has_libraries
        )
    )
    return res
