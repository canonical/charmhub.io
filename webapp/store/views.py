import re

import humanize
import talisker
from canonicalwebteam.discourse import DocParser
from canonicalwebteam.discourse.exceptions import PathNotFoundError
from canonicalwebteam.flask_base.decorators import (
    exclude_xframe_options_header,
)
from canonicalwebteam.store_api.exceptions import StoreApiResponseErrorList
from canonicalwebteam.store_api.stores.charmstore import CharmPublisher
from flask import Blueprint, Response, abort
from flask import current_app as app
from flask import jsonify, redirect, render_template, request
from pybadges import badge
from mistune import html

from webapp.config import DETAILS_VIEW_REGEX, CATEGORIES
from webapp.decorators import (
    redirect_uppercase_to_lowercase,
    store_maintenance,
)
from webapp.helpers import get_soup, modify_headers, discourse_api
from webapp.store import logic
from webapp.topics.views import topic_list

store = Blueprint(
    "store", __name__, template_folder="/templates", static_folder="/static"
)
publisher_api = CharmPublisher(talisker.requests.get_session())

SEARCH_FIELDS = [
    "result.categories",
    "result.summary",
    "result.media",
    "result.title",
    "result.publisher.display-name",
    "default-release.revision.revision",
    "default-release.channel",
    "result.deployable-on",
]


@store.route("/")
@store_maintenance
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
        charm = logic.add_store_front_data(featured_charms[i], False)
        featured_packages.append(charm)

    context["featured_charms"] = featured_packages

    return render_template("store.html", **context)


@store.route("/packages.json")
def get_packages():
    query = request.args.get("q", default=None, type=str)
    provides = request.args.get("provides", default=None, type=str)
    requires = request.args.get("requires", default=None, type=str)
    context = {"packages": [], "size": 0}

    if query:
        results = app.store_api.find(query=query, fields=SEARCH_FIELDS).get(
            "results"
        )
        context["q"] = query
    elif provides or requires:
        if provides:
            provides = provides.split(",")
        if requires:
            requires = requires.split(",")

        print(provides)
        print(requires)
        results = app.store_api.find(
            provides=provides, requires=requires, fields=SEARCH_FIELDS
        ).get("results")

        context["provides"] = provides
        context["requires"] = requires
    else:
        results = app.store_api.find(fields=SEARCH_FIELDS).get("results", [])

    packages = []
    total_packages = 0

    for i, item in enumerate(results):
        total_packages += 1
        package = logic.add_store_front_data(results[i], False)
        packages.append(package)

    context["packages"] = packages
    context["size"] = total_packages

    return context


FIELDS = [
    "result.media",
    "default-release",
    "result.categories",
    "result.publisher.display-name",
    "result.title",
    "result.unlisted",
    "channel-map",
    "result.deployable-on",
]


def get_package(entity_name, channel_request=None, fields=FIELDS):
    # Get entity info from API
    package = app.store_api.get_item_details(
        entity_name, channel=channel_request, fields=fields
    )

    # If the package is not published, return a 404
    if not package["default-release"]:
        abort(404)

    # Fix issue #1010
    if channel_request:
        channel_map = app.store_api.get_item_details(
            entity_name, fields=["channel-map"]
        )
        package["channel-map"] = channel_map["channel-map"]

    package = logic.add_store_front_data(package, True)

    for channel in package["channel-map"]:
        channel["channel"]["released-at"] = logic.convert_date(
            channel["channel"]["released-at"]
        )

    return package


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_overview(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)

    extra_fields = [
        "default-release.revision.readme-md",
        "result.bugs-url",
        "result.website",
        "result.summary",
        "default-release.revision.metadata-yaml",
    ]

    package = get_package(
        entity_name, channel_request, FIELDS.copy() + extra_fields
    )

    context = {
        "package": package,
        "channel_requested": channel_request,
        "navigation": None,
    }

    if not package["store_front"]["docs_topic"]:
        navigation = None
    else:
        docs_url_prefix = f"/{package['name']}/docs"

        docs = DocParser(
            api=discourse_api,
            index_topic_id=package["store_front"]["docs_topic"],
            url_prefix=docs_url_prefix,
        )
        docs.parse()

        topic = docs.index_topic

        docs.parse_topic(topic)

        navigation = docs.navigation

        overview = {
            "hidden": False,
            "level": 1,
            "path": "",
            "navlink_href": f"/{entity_name}",
            "navlink_fragment": "",
            "navlink_text": "Overview",
            "is_active": True,
            "has_active_child": False,
            "children": [],
        }

        if len(navigation["nav_items"]) > 0:
            navigation["nav_items"][0]["children"].insert(0, overview)
            # If the first item in docs nav is "overview",
            # prefix with "Docs - "
            if (
                navigation["nav_items"][0]["children"][1]["navlink_text"]
                == "Overview"
            ):
                navigation["nav_items"][0]["children"][1][
                    "navlink_text"
                ] = "Docs - Overview"
        else:
            # If there is no navigation but we've got here, there are docs
            # So add a top level "Docs item". Example: /easyrsa
            navigation["nav_items"] = [
                {
                    "level": 0,
                    "children": [
                        overview,
                        {
                            "level": 1,
                            "path": "",
                            "navlink_href": f"/{entity_name}/docs",
                            "navlink_fragment": "",
                            "navlink_text": "Docs",
                            "is_active": True,
                            "has_active_child": False,
                            "children": [],
                        },
                    ],
                }
            ]

        context["navigation"] = navigation

    readme = package["default-release"]["revision"].get(
        "readme-md", "No readme available"
    )

    readme = html(readme)
    # Remove Markdown/HTML comments
    readme = re.sub("(<!--.*-->)", "", readme, flags=re.DOTALL)
    readme = get_soup(readme)
    readme = modify_headers(readme)

    context["readme"] = readme
    context["package_type"] = package["type"]

    return render_template("details/overview.html", **context)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs')
@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/docs/<path:path>'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_docs(entity_name, path=None):
    channel_request = request.args.get("channel", default=None, type=str)
    extra_fields = [
        "default-release.revision.metadata-yaml",
        "result.bugs-url",
        "result.website",
    ]

    package = get_package(
        entity_name, channel_request, FIELDS.copy() + extra_fields
    )

    # If no docs, redirect to main page
    if not package["store_front"]["docs_topic"]:
        return redirect(f"/{entity_name}")

    docs_url_prefix = f"/{package['name']}/docs"

    docs = DocParser(
        api=discourse_api,
        index_topic_id=package["store_front"]["docs_topic"],
        url_prefix=docs_url_prefix,
    )
    docs.parse()

    if path:
        try:
            topic_id = docs.resolve_path(path)[0]
        except PathNotFoundError:
            abort(404)

        topic = docs.api.get_topic(topic_id)
    else:
        topic = docs.index_topic

    document = docs.parse_topic(topic)

    navigation = docs.navigation

    overview = {
        "hidden": False,
        "level": 1,
        "path": "",
        "navlink_href": f"/{entity_name}",
        "navlink_fragment": "",
        "navlink_text": "Overview",
        "is_active": False,
        "has_active_child": False,
        "children": [],
    }
    if len(navigation["nav_items"]) > 0:
        navigation["nav_items"][0]["children"].insert(0, overview)
        # If the first item in docs nav is "overview", prefix with "Docs - "
        if (
            navigation["nav_items"][0]["children"][1]["navlink_text"]
            == "Overview"
        ):
            navigation["nav_items"][0]["children"][1][
                "navlink_text"
            ] = "Docs - Overview"
    else:
        # If there is no navigation but we've got here, there are docs
        # So add a top level "Docs item". Example: /easyrsa
        navigation["nav_items"] = [
            {
                "level": 0,
                "children": [
                    overview,
                    {
                        "level": 1,
                        "path": "",
                        "navlink_href": f"/{entity_name}/docs",
                        "navlink_fragment": "",
                        "navlink_text": "Docs",
                        "is_active": True,
                        "has_active_child": False,
                        "children": [],
                    },
                ],
            }
        ]

    context = {
        "package": package,
        "navigation": navigation,
        "body_html": document["body_html"],
        "last_update": document["updated"],
        "forum_url": docs.api.base_url,
        "topic_path": document["topic_path"],
        "channel_requested": channel_request,
    }

    return render_template("details/docs.html", **context)


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/configure')
@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/configure/<path:path>'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_configuration(entity_name, path=None):
    channel_request = request.args.get("channel", default=None, type=str)
    extra_fields = [
        "default-release.revision.config-yaml",
    ]

    package = get_package(
        entity_name, channel_request, FIELDS.copy() + extra_fields
    )
    subpackage = None

    if package["type"] == "bundle":
        bundle_charms = package["store_front"]["bundle"]["charms"]

        if not path and bundle_charms:
            default_charm = bundle_charms[0]
            return redirect(
                f"/{entity_name}/configure/{default_charm['name']}"
            )

        if path:
            if not any(d["name"] == path for d in bundle_charms):
                abort(404)

            try:
                subpackage = get_package(path)
            except StoreApiResponseErrorList:
                subpackage = None

    return render_template(
        f"details/configure-{package['type']}.html",
        package=package,
        subpackage=subpackage,
        channel_requested=channel_request,
        subpackage_path=path,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/actions')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_actions(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    extra_fields = [
        "default-release.revision.actions-yaml",
    ]

    package = get_package(
        entity_name, channel_request, FIELDS.copy() + extra_fields
    )
    return render_template(
        "details/actions.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/libraries')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_libraries(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    if libraries:
        first_lib = libraries[0]["name"]
        return redirect(f"/{entity_name}/libraries/{first_lib}")

    return render_template(
        "details/libraries/no-libraries.html",
        entity_name=entity_name,
        package=package,
        libraries=libraries,
        channel_requested=channel_request,
    )


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>'
)
@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>/source-code'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_library(entity_name, library_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    library_id = logic.get_library(library_name, libraries)

    if not library_id:
        abort(404)

    library = publisher_api.get_charm_library(entity_name, library_id)

    docstrings = logic.process_python_docs(library, module_name=library_name)

    # Charmcraft string to fetch the library
    fetch_charm = entity_name.replace("-", "_")
    fetch_api = library["api"]
    fetch_string = f"charms.{fetch_charm}.v{fetch_api}.{library_name}"

    if "source-code" in request.path[1:]:
        template = "details/libraries/source-code.html"
    else:
        template = "details/libraries/docstring.html"

    return render_template(
        template,
        entity_name=entity_name,
        package=package,
        libraries=libraries,
        library=library,
        docstrings=docstrings,
        channel_requested=channel_request,
        library_name=library_name,
        fetch_string=fetch_string,
        creation_date=logic.convert_date(library["created-at"]),
    )


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/libraries/<string:library_name>/download'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def download_library(entity_name, library_name):
    lib_parts = library_name.split(".")

    if len(lib_parts) > 2:
        lib_name = "." + ".".join(lib_parts[-2:])
    else:
        lib_name = library_name

    libraries = logic.process_libraries(
        publisher_api.get_charm_libraries(entity_name)
    )

    library = next(
        (lib for lib in libraries if lib.get("name") == lib_name),
        None,
    )

    if not library:
        abort(404)

    library = publisher_api.get_charm_library(entity_name, library["id"])

    return Response(
        library["content"],
        mimetype="text/x-python",
        headers={
            "Content-disposition": "attachment; "
            f"filename={library['library-name']}.py"
        },
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/history')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_history(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    return render_template(
        "details/history.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/integrations')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_integrations(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    return render_template(
        "details/integrations.html",
        package=package,
    )


@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/integrations.json'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_integrations_data(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    relations = (
        package.get("default-release", {})
        .get("revision", {})
        .get("relations", {})
    )

    grouped_relations = {
        "provides": [
            {**provide[1], "key": provide[0]}
            for provide in list(relations["provides"].items())
        ],
        "requires": [
            {**require[1], "key": require[0]}
            for require in list(relations["requires"].items())
        ],
    }

    return jsonify({"grouped_relations": grouped_relations})


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/resources')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_resources(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    # /resources redirect to the first resource
    if package["default-release"]["resources"]:
        name = package["default-release"]["resources"][0]["name"]
        return redirect(f"/{entity_name}/resources/{name}")
    else:
        return render_template("details/no-resources.html", package=package)


@store.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/resources/<string:resource_name>'
)
@store_maintenance
@redirect_uppercase_to_lowercase
def details_resource(entity_name, resource_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)
    resources = package["default-release"]["resources"]

    if not resources:
        return redirect(f"/{entity_name}/resources")

    resource = next(
        (item for item in resources if item["name"] == resource_name), None
    )

    if not resource:
        return redirect(f"/{entity_name}/resources")

    # Get OCI image details
    if resource["type"] == "oci-image":
        oci_details = app.store_api.process_response(
            app.store_api.session.get(resource["download"]["url"])
        )
        resource["image_name"], resource["digest"] = oci_details[
            "ImageName"
        ].split("@")
        resource["short_digest"] = resource["digest"].split(":")[1][:12]

    revisions = app.store_api.get_resource_revisions(
        entity_name, resource_name
    )
    revisions = sorted(revisions, key=lambda k: k["revision"], reverse=True)

    # Humanize sizes
    resource["size"] = humanize.naturalsize(resource["download"]["size"])
    resource["updated"] = logic.convert_date(resource["created-at"])

    for revision in revisions:
        revision["size"] = humanize.naturalsize(revision["download"]["size"])
        revision["updated"] = logic.convert_date(revision["created-at"])

    return render_template(
        "details/resources.html",
        package=package,
        channel_requested=channel_request,
        resource=resource,
        revisions=revisions,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/integrate')
@store_maintenance
@redirect_uppercase_to_lowercase
def details_integrate(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    package = get_package(entity_name, channel_request, FIELDS)

    return render_template(
        "details/integrate.html",
        package=package,
        channel_requested=channel_request,
    )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/badge.svg')
def entity_badge(entity_name):
    package = app.store_api.get_item_details(entity_name, fields=FIELDS)

    if not package["default-release"]:
        abort(404)

    entity_link = request.url_root + entity_name
    right_text = "".join(
        [
            package["default-release"]["channel"]["track"],
            "/",
            package["default-release"]["channel"]["risk"],
            " ",
            package["default-release"]["revision"]["version"],
        ]
    )

    svg = badge(
        left_text=package["name"],
        right_text=right_text,
        right_color="#0e8420",
        left_link=entity_link,
        right_link=entity_link,
        logo=(
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "
            "viewBox='0 0 64 64'%3E%3Cg fill-rule='evenodd' "
            "fill='none'%3E%3Cg fill-rule='nonzero'%3E%3Ccircle cy='32' "
            "cx='32' r='32' fill='%23fff'/%3E%3Cg transform='translate(13.622"
            " 5.6546)' fill='%23585858'%3E%3Ccircle cy='24.614' cx='20.307' "
            "r='1.9732'/%3E%3Cpath d='m22.129 20.971h-3.643v-14.571c0-3.5154"
            " 2.86-6.3753 6.375-6.3753 3.515-0.000025 6.375 2.8599 6.375 6."
            "375v3.6433h-3.643v-3.6433c0-0.7297-0.284-1.4159-0.8-1.932-0.51"
            "6-0.5159-1.202-0.8002-1.932-0.8002-1.506 0-2.732 1.2255-2.732 "
            "2.7322v14.571z'/%3E%3Cpath d='m33.968 27.346c-3.515 0-6.375-2."
            "859-6.375-6.375v-9.107h3.643v9.107c0 1.507 1.226 2.732 2.732 2."
            "732 1.507 0 2.733-1.225 2.733-2.732v-9.107h3.642v9.107c0 1.703"
            "-0.663 3.304-1.867 4.508s-2.805 1.867-4.508 1.867z'/%3E%3Ccircle"
            " cy='46.471' cx='2.093' r='1.9732'/%3E%3Cpath d='m3.9143 42.829"
            "h-3.6429l0.00002-20.036c0-3.515 2.86-6.375 6.3751-6.375 3.5155 0"
            " 6.3755 2.86 6.3755 6.375v3.643h-3.6433v-3.643c0-0.73-0.284-1."
            "416-0.8001-1.932-0.5159-0.516-1.2022-0.8-1.9319-0.8-1.5064 0-2."
            "7322 1.225-2.7322 2.732l-0.0002 20.036z'/%3E%3Cpath d='m15.754 "
            "43.74c-3.516 0-6.3753-2.86-6.3753-6.376v-9.107h3.6433v9.107c0 "
            "1.506 1.225 2.732 2.732 2.732 1.506 0 2.732-1.226 2.732-2.732v-"
            "9.107h3.643v9.107c0 1.703-0.663 3.304-1.867 4.508-1.205 1.204-2"
            ".805 1.868-4.508 1.868z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
        ),
    )

    return svg, 200, {"Content-Type": "image/svg+xml"}


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/embedded')
@exclude_xframe_options_header
def entity_embedded_card(entity_name):
    store_design = request.args.get("store_design", default=False, type=bool)
    channel_request = request.args.get("channel", default=None, type=str)
    try:
        package = get_package(entity_name, channel_request, FIELDS)

        package["default-release"]["channel"][
            "released-at"
        ] = logic.convert_date(
            package["default-release"]["channel"]["released-at"]
        )

        button = request.args.get("button")
        if button and button not in ["black", "white"]:
            button = None

        context = {
            "store_design": store_design,
            "button": button,
            "package": package,
            "show_channels": request.args.get("channels"),
            "show_summary": request.args.get("summary"),
            "show_base": request.args.get("base"),
        }

        return render_template(
            "embeddable-card.html",
            **context,
        )
    except Exception:
        return (
            render_template(
                "embeddable-404.html",
                store_design=store_design,
                entity_name=entity_name,
            ),
            404,
        )


@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/embedded/interface'
)
@exclude_xframe_options_header
def entity_embedded_interface_card(entity_name):
    channel_request = request.args.get("channel", default=None, type=str)
    try:
        package = get_package(entity_name, channel_request, FIELDS)

        package["default-release"]["channel"][
            "released-at"
        ] = logic.convert_date(
            package["default-release"]["channel"]["released-at"]
        )

        libraries = logic.process_libraries(
            publisher_api.get_charm_libraries(entity_name)
        )

        context = {
            "package": package,
            "libraries": libraries,
        }

        return render_template(
            "interface-card.html",
            **context,
        )
    except Exception:
        return (
            render_template(
                "interface-card-404.html",
                entity_name=entity_name,
            ),
            404,
        )


@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/icon')
def entity_icon(entity_name):
    icon_url = (
        "https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg"
    )
    package = None

    try:
        package = app.store_api.get_item_details(
            entity_name,
            fields=[
                "result.media",
            ],
        )
    except StoreApiResponseErrorList:
        pass

    if package and package["result"]["media"]:
        icon_url = package["result"]["media"][0]["url"]

    return redirect(
        "https://res.cloudinary.com/canonical/image/fetch/f_auto"
        f",q_auto,fl_sanitize,w_64,h_64/{icon_url}"
    )


@store.route(
    '/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/icon-no-default'
)
def entity_icon_missing(entity_name):
    package = None

    try:
        package = app.store_api.get_item_details(
            entity_name,
            fields=[
                "result.media",
            ],
        )
    except StoreApiResponseErrorList:
        pass

    if package and package["result"]["media"]:
        icon_url = package["result"]["media"][0]["url"]

        return redirect(
            "https://res.cloudinary.com/canonical/image/fetch/f_auto"
            f",q_auto,fl_sanitize,w_64,h_64/{icon_url}"
        )

    abort(404)


# This method is a temporary hack to show bundle icons on the
# homepage, and should be removed once the icons are available via the api
@store.route('/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/charms.json')
def get_charms_from_bundle(entity_name):
    package = get_package(entity_name)

    if package["type"] != "bundle":
        return "Requested object should be a bundle", 400

    return jsonify({"charms": package["store_front"]["bundle"]["charms"]})
