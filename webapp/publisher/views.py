import json

from cachetools import cached
from cache.cache_utility import redis_cache
from canonicalwebteam.exceptions import StoreApiResponseErrorList
from flask import (
    Blueprint,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
    make_response,
)
from flask.json import jsonify
from webapp.config import DETAILS_VIEW_REGEX
from webapp.decorators import login_required, cached_redirect
from webapp.packages.store_packages import package
from webapp.publisher.logic import get_all_architectures, process_releases
from webapp.observability.utils import trace_function
from webapp.store_api import publisher_gateway
from webapp.utils.emailer import get_emailer

publisher = Blueprint(
    "publisher",
    __name__,
    template_folder="/templates",
    static_folder="/static",
)


@trace_function
@publisher.route("/account/details")
@login_required
def get_account_details():
    return render_template("publisher/account-details.html")


@trace_function
def get_package_metadata(entity_name):
    key = f"package_metadata:{session['account']['id']}:{entity_name}"
    package = redis_cache.get(key, expected_type=dict)
    if not package:
        package = publisher_gateway.get_package_metadata(session, entity_name)
        redis_cache.set(key, package, ttl=300)
    return package

@trace_function
@publisher.route(
    '/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/'
    + '<regex("listing|releases|publicise|collaboration|settings"):path>'
)
@login_required
def get_publisher(entity_name, path):
    session["developer_token"] = session["account-auth"]
    package = get_package_metadata(entity_name)
    context = {
        "package": package,
    }
    return render_template("publisher/publisher.html", **context)


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>',
)
@login_required
def get_package(entity_name):
    session["developer_token"] = session["account-auth"]
    package = get_package_metadata(entity_name)
    return jsonify({"data": package, "success": True})


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>',
    methods=["PATCH"],
)
@login_required
def update_package(entity_name):
    payload = request.get_json()

    res = {}

    try:
        package = publisher_gateway.update_package_metadata(
            session["account-auth"], "charm", entity_name, payload
        )
        res["data"] = package
        res["success"] = True
        res["message"] = ""
        response = make_response(res, 200)
    except StoreApiResponseErrorList as error_list:
        error_messages = [
            f"{error.get('message', 'Unable to update this charm or bundle')}"
            for error in error_list.errors
        ]
        if "unauthorized" in error_messages:
            res["message"] = "Package not found"
        else:
            res["message"] = " ".join(error_messages)
        res["success"] = False
        response = make_response(res, 500)

    return response


@trace_function
@publisher.route("/charms")
@publisher.route("/bundles")
@login_required
def list_page():
    key = f"account_packages:{session['account']['id']}:{request.path[1:-1]}"
    cached = redis_cache.get(key, expected_type=dict)
    if cached:
        context = cached
    else:
        publisher_charms = publisher_gateway.get_account_packages(
            session["account-auth"], "charm", include_collaborations=True
        )

        page_type = request.path[1:-1]

        context = {
            "published": [
                {**c, "is_owner": c["publisher"]["id"] == session["account"]["id"]}
                for c in publisher_charms
                if c["status"] == "published" and c["type"] == page_type
            ],
            "registered": [
                {**c, "is_owner": c["publisher"]["id"] == session["account"]["id"]}
                for c in publisher_charms
                if c["status"] == "registered" and c["type"] == page_type
            ],
            "page_type": page_type,
        }
        redis_cache.set(key, context, ttl=600)
    return render_template("publisher/list.html", **context)


@trace_function
@publisher.route("/accept-invite")
@login_required
@cached_redirect
def accept_invite():
    return render_template("publisher/accept-invite.html")


@trace_function
@publisher.route("/accept-invite", methods=["POST"])
@login_required
def accept_post_invite():
    res = {}

    try:
        token = request.form.get("token")
        package = request.form.get("package")
        response = publisher_gateway.accept_invite(
            session["account-auth"], package, token
        )

        if response.status_code == 204:
            res["success"] = True
            return make_response(res, 200)
        else:
            res["success"] = False
            errors = response.json().get("error-list", [])
            res["message"] = (
                errors[0].get("message") if errors else "Unknown error"
            )
            return make_response(res, 500)

    except StoreApiResponseErrorList as error_list:
        res["success"] = False
        error_messages = [
            f"{error.get('message', 'An error occured')}"
            for error in error_list.errors
        ]
        res["message"] = " ".join(error_messages)
    except Exception:
        res["success"] = False
        res["message"] = "An error occured"

    return make_response(res, 500)


@trace_function
@publisher.route("/reject-invite", methods=["POST"])
@login_required
def reject_post_invite():
    res = {}

    try:
        token = request.form.get("token")
        package = request.form.get("package")
        response = publisher_gateway.reject_invite(
            session["account-auth"], package, token
        )

        if response.status_code == 204:
            res["success"] = True
            return make_response(res, 200)
        else:
            res["success"] = False
            res["message"] = "An error occured"
            return make_response(res, 200)

    except StoreApiResponseErrorList as error_list:
        res["success"] = False
        error_messages = [
            f"{error.get('message', 'An error occured')}"
            for error in error_list.errors
        ]
        res["message"] = " ".join(error_messages)
        response = make_response(res, 500)
    except Exception:
        res["success"] = False
        res["message"] = "An error occured"

    return response


@trace_function
@publisher.route(
    '/api/packages/<regex("'
    + DETAILS_VIEW_REGEX
    + '"):entity_name>/collaborators',
)
@login_required
def get_collaborators(entity_name):
    res = {}

    try:
        collaborators = publisher_gateway.get_collaborators(
            session["account-auth"], entity_name
        )
        res["success"] = True
        res["data"] = collaborators
        response = make_response(res, 200)
    except StoreApiResponseErrorList as error_list:
        error_messages = [
            f"{error.get('message', 'An error occured')}"
            for error in error_list.errors
        ]
        res["message"] = " ".join(error_messages)
        res["success"] = False
        response = make_response(res, 500)

    return response


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/invites',
)
@login_required
def get_pending_invites(entity_name):
    res = {}

    try:
        invites = publisher_gateway.get_pending_invites(
            session["account-auth"], entity_name
        )
        res["success"] = True
        res["data"] = invites["invites"]
        response = make_response(res, 200)
    except StoreApiResponseErrorList as error_list:
        error_messages = [
            f"{error.get('message', 'An error occured')}"
            for error in error_list.errors
        ]
        res["message"] = " ".join(error_messages)
        res["success"] = False
        response = make_response(res, 500)

    return response


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/invites',
    methods=["POST"],
)
@login_required
def invite_collaborators(entity_name):
    res = {}

    try:
        collaborators = request.form.get("collaborators")
        if not collaborators:
            res["success"] = False
            res["message"] = "No collaborators provided"
            return make_response(res, 400)

        result = publisher_gateway.invite_collaborators(
            session["account-auth"], entity_name, [collaborators]
        )

        token = result["tokens"][0]["token"]

        invite_link = (
            f"https://charmhub.io/accept-invite?package={entity_name}"
            f"&token={token}"
        )
        emailer = get_emailer()
        emailer.send_email_template(
            template_path="emails/collaborator-invite.html",
            to_email=collaborators,
            context={
                "charm_name": entity_name,
                "invite_link": invite_link,
            },
            subject=(
                f"You have been invited to as a collaborator on "
                f"{entity_name} in Charmhub"
            ),
        )

        res["success"] = True
        res["data"] = result["tokens"]
        return make_response(res, 200)
    except StoreApiResponseErrorList as error_list:
        res["success"] = False
        messages = [
            f"{error.get('message', 'An error occurred')}"
            for error in error_list.errors
        ]
        res["message"] = (" ").join(messages)
    except Exception:
        res["success"] = False
        res["message"] = "An error occurred"
        raise

    return make_response(res, 500)


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/invites',
    methods=["DELETE"],
)
@login_required
def revoke_invite(entity_name):
    res = {}

    try:
        collaborator = request.form.get("collaborator")
        response = publisher_gateway.revoke_invites(
            session["account-auth"], entity_name, [collaborator]
        )

        if response.status_code == 204:
            res["success"] = True
            return make_response(res, 200)
        else:
            res["success"] = False
            res["message"] = "An error occurred"
            return make_response(res, 500)

    except StoreApiResponseErrorList as error_list:
        res["success"] = False
        messages = [
            f"{error.get('message', 'An error occurred')}"
            for error in error_list.errors
        ]
        res["message"] = (" ").join(messages)

    return make_response(res, 500)


@trace_function
@publisher.route("/register-name")
@login_required
def register_name():
    entity_name = request.args.get("entity_name", default="", type=str)

    invalid_name_str = request.args.get(
        "invalid_name", default="False", type=str
    )
    invalid_name = invalid_name_str == "True"

    reserved_name_str = request.args.get(
        "reserved_name", default="False", type=str
    )
    reserved_name = reserved_name_str == "True"

    already_registered_str = request.args.get(
        "already_registered", default="False", type=str
    )
    already_registered = already_registered_str == "True"

    already_owned_str = request.args.get(
        "already_owned", default="False", type=str
    )
    already_owned = already_owned_str == "True"

    context = {
        "entity_name": entity_name,
        "reserved_name": reserved_name,
        "invalid_name": invalid_name,
        "already_owned": already_owned,
        "already_registered": already_registered,
    }
    return render_template("publisher/register-name.html", **context)


@trace_function
@publisher.route("/register-name", methods=["POST"])
@login_required
def post_register_name():
    VALID_TYPES = {"charm", "bundle"}
    data = {
        "name": request.form["name"],
        "type": request.form["type"],
        "private": True if request.form.get("private") == "private" else False,
    }

    if data["type"] not in VALID_TYPES:
        flash("Invalid type specified.", "negative")
        return redirect(url_for(".register_name"))

    try:
        result = publisher_gateway.register_package_name(
            session["account-auth"], data
        )
        if result:
            flash(
                f"Your {data['type']} name has been successfully registered.",
                "positive",
            )
    except StoreApiResponseErrorList as api_response_error_list:
        for error in api_response_error_list.errors:
            if error["code"] == "api-error":
                return redirect(
                    url_for(
                        ".register_name",
                        entity_name=data["name"],
                        invalid_name=True,
                    )
                )
            elif error["code"] == "reserved-name":
                return redirect(
                    url_for(
                        ".register_name",
                        entity_name=data["name"],
                        reserved_name=True,
                    )
                )
            elif error["code"] == "already-registered":
                return redirect(
                    url_for(
                        ".register_name",
                        entity_name=data["name"],
                        already_registered=True,
                    )
                )
            elif error["code"] == "already-owned":
                return redirect(
                    url_for(
                        ".register_name",
                        entity_name=data["name"],
                        already_owned=True,
                    )
                )

    if data["type"] == "charm":
        return redirect("/charms")
    elif data["type"] == "bundle":
        return redirect("/bundles")


@trace_function
@publisher.route("/register-name-dispute")
@login_required
def register_name_dispute():
    entity_name = request.args.get("entity-name", type=str)

    if not entity_name:
        return redirect(url_for(".register_name", entity_name=entity_name))

    return render_template(
        "publisher/register-name-dispute/index.html", entity_name=entity_name
    )


@trace_function
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


@trace_function
@publisher.route("/packages/<package_name>", methods=["DELETE"])
@login_required
def delete_package(package_name):
    resp = publisher_gateway.unregister_package_name(
        session["account-auth"], package_name
    )
    if resp.status_code == 200:
        return ("", 200)
    return (
        jsonify({"error": resp.json["error-list"][0]["message"]}),
        resp.status_code,
    )


@trace_function
@publisher.route("/<charm_name>/create-track", methods=["POST"])
@login_required
def post_create_track(charm_name):
    track_name = request.form.get("track-name")
    version_pattern = request.form.get("version-pattern")
    auto_phasing_percentage = request.form.get("auto-phasing-percentage")

    if auto_phasing_percentage is not None:
        auto_phasing_percentage = float(auto_phasing_percentage)

    response = publisher_gateway.create_track(
        session,
        charm_name,
        track_name,
        version_pattern,
        auto_phasing_percentage,
    )
    if response.status_code == 201:
        return response.json(), response.status_code
    if response.status_code == 409:
        return (
            jsonify({"error": "Track already exists."}),
            response.status_code,
        )
    if "error-list" in response.json():
        return (
            jsonify({"error": response.json()["error-list"][0]["message"]}),
            response.status_code,
        )
    return response.json(), response.status_code


@trace_function
@publisher.route(
    '/api/packages/<regex("' + DETAILS_VIEW_REGEX + '"):entity_name>/releases',
)
@login_required
def get_releases(entity_name: str):
    key = f"package_releases:{session['account']['id']}:{entity_name}"
    res = redis_cache.get(key, expected_type=dict) or {}

    try:
        if not res:
            release_data = publisher_gateway.get_releases(
                session["account-auth"], entity_name
            )
            res["success"] = True

            res["data"] = {}

            res["data"]["releases"] = process_releases(
                release_data["channel-map"],
                release_data["package"]["channels"],
                release_data["revisions"],
            )
            res["data"]["all_architectures"] = get_all_architectures(
                res["data"]["releases"]
            )
            redis_cache.set(key, res, ttl=300)
        response = make_response(res, 200)

    except StoreApiResponseErrorList as error_list:
        error_messages = [
            f"{error.get('message', 'An error occured')}"
            for error in error_list.errors
        ]
        res["message"] = " ".join(error_messages)
        res["success"] = False
        response = make_response(res, 500)

    return response
