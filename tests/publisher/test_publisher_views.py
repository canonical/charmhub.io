import unittest
from webapp.app import app
from tests.mock_data.mock_store_logic import sample_charm
from unittest.mock import patch

from canonicalwebteam.exceptions import StoreApiResponseErrorList


class TestPublisherViews(unittest.TestCase):
    @patch(
        "webapp.decorators.login_required",
    )
    def setUp(self, mock_login_required):
        mock_login_required.return_value = lambda: True
        self.app = app
        self.app.config["TESTING"] = True
        self.app.config["WTF_CSRF_ENABLED"] = []
        self.client = self.app.test_client()
        self.set_session()

    def set_session(self):
        with self.client.session_transaction() as session:
            session["account"] = {
                "display-name": "test-display-name",
                "email": "test-email",
                "username": "test-username",
            }
            session["account-auth"] = "test-auth"

    def test_get_account_details_no_login(self):
        with self.client.session_transaction() as session:
            del session["account-auth"]
            del session["account"]
        res = self.client.get("/account/details")
        self.assertEqual(res.status_code, 302)

    @patch(
        "webapp.authentication.is_authenticated",
        return_value=True,
    )
    def test_get_account_details(self, mock_is_authenticated):
        res = self.client.get("/account/details")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"test-display-name", res.data)
        self.assertIn(b"test-email", res.data)
        self.assertIn(b"test-username", res.data)

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.get_package_metadata"
    )
    def test_get_publisher(self, mock_get_package_metadata):
        mock_get_package_metadata.return_value = sample_charm
        for endpoint in [
            "listing",
            "releases",
            "publicise",
            "collaboration",
            "settings",
        ]:
            res = self.client.get(f"/test-entity/{endpoint}")
            self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.get_package_metadata"
    )
    def test_get_package(self, mock_get_package_metadata):
        mock_get_package_metadata.return_value = {"name": "test-package"}
        res = self.client.get("/api/packages/test-entity")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.json,
            {"success": True, "data": mock_get_package_metadata.return_value},
        )

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.update_package_metadata"
    )
    def test_update_package(self, mock_update_package_metadata):
        mock_update_package_metadata.return_value = {"name": "test-package"}
        res = self.client.patch(
            "/api/packages/test-entity", json={"key": "value"}
        )
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.update_package_metadata"
    )
    def test_update_package_failure(self, mock_update_package_metadata):
        mock_update_package_metadata.side_effect = StoreApiResponseErrorList(
            "test-error", 500, []
        )
        res = self.client.patch(
            "/api/packages/test-entity", json={"key": "value"}
        )
        self.assertEqual(res.status_code, 500)
        self.assertEqual(res.json["success"], False)

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.update_package_metadata"
    )
    def test_update_package_unauthorized(self, mock_update_package_metadata):
        mock_update_package_metadata.side_effect = StoreApiResponseErrorList(
            "test-error", 500, [{"message": "unauthorized"}]
        )
        res = self.client.patch(
            "/api/packages/test-entity", json={"key": "value"}
        )
        self.assertEqual(res.status_code, 500)
        self.assertEqual(res.json["success"], False)
        self.assertEqual(res.json["message"], "Package not found")

    @patch(
        "canonicalwebteam.store_api.publishergw."
        "PublisherGW.get_account_packages"
    )
    def test_list_page(self, mock_get_account_packages):
        mock_get_account_packages.return_value = [
            {
                "contact": "email",
                "id": "ChgcZB3RhaDOnhkAv9cgRg52LhjBbDt8",
                "media": [
                    {
                        "type": "icon",
                        "url": "https://example.com/icon.svg",
                    }
                ],
                "name": "postgresql",
                "private": False,
                "publisher": {
                    "display-name": "Canonical Data Platform",
                },
                "status": "published",
                "type": "charm",
            },
        ]

        res = self.client.get("/charms")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"postgresql", res.data)
        self.assertIn(b"Published charms", res.data)
        res = self.client.get("/bundles")
        self.assertEqual(res.status_code, 200)
        self.assertNotIn(b"postgresql", res.data)

    def test_accept_invite(self):
        res = self.client.get("/accept-invite")
        self.assertIn(b"Success", res.data)
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.accept_invite"
    )
    def test_accept_post_invite(self, mock_accept_invite):
        mock_accept_invite.return_value.status_code = 204
        res = self.client.post(
            "/accept-invite",
            data={"token": "test-token", "package": "test-package"},
        )
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.accept_invite"
    )
    def test_accept_post_invite_failed(self, mock_accept_invite):
        mock_accept_invite.return_value.status_code = 401
        res = self.client.post(
            "/accept-invite",
            data={"token": "test-token", "package": "test-package"},
        )
        self.assertEqual(res.status_code, 500)
        self.assertEqual(res.json["message"], "An error occured")

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.reject_invite"
    )
    def test_reject_post_invite(self, mock_reject_invite):
        mock_reject_invite.return_value.status_code = 204
        res = self.client.post(
            "/reject-invite",
            data={"token": "test-token", "package": "test-package"},
        )
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.get_collaborators"
    )
    def test_get_collaborators(self, mock_get_collaborators):
        mock_get_collaborators.return_value = [{"name": "collaborator"}]
        res = self.client.get("/api/packages/test-entity/collaborators")
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.get_collaborators"
    )
    def test_get_collaborators_failed(self, mock_get_collaborators):
        mock_get_collaborators.side_effect = StoreApiResponseErrorList(
            "test-error", 500, []
        )
        res = self.client.get("/api/packages/test-entity/collaborators")
        self.assertEqual(res.status_code, 500)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.get_pending_invites"
    )
    def test_get_pending_invites(self, mock_get_pending_invites):
        mock_get_pending_invites.return_value = {
            "invites": [{"name": "invite"}]
        }
        res = self.client.get("/api/packages/test-entity/invites")
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.invite_collaborators"
    )
    def test_invite_collaborators(self, mock_invite_collaborators):
        mock_invite_collaborators.return_value = {"tokens": ["token"]}
        res = self.client.post(
            "/api/packages/test-entity/invites",
            data={"collaborators": "collaborator"},
        )
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.revoke_invites"
    )
    def test_revoke_invite(self, mock_revoke_invites):
        mock_revoke_invites.return_value.status_code = 204
        res = self.client.delete(
            "/api/packages/test-entity/invites",
            data={"collaborator": "collaborator"},
        )
        self.assertEqual(res.status_code, 200)

    def test_register_name(self):
        res = self.client.get("/register-name")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Register a new", res.data)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.register_package_name"
    )
    def test_post_register_name(self, mock_register_package_name):
        mock_register_package_name.return_value = True
        res = self.client.post(
            "/register-name",
            data={
                "name": "test-name",
                "type": "charm",
                "private": "private",
            },
        )
        self.assertEqual(res.status_code, 302)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.register_package_name"
    )
    def test_post_register_name_already_owned(
        self, mock_register_package_name
    ):
        mock_register_package_name.side_effect = StoreApiResponseErrorList(
            "test-error", 500, [{"code": "already-owned"}]
        )
        res = self.client.post(
            "/register-name",
            data={
                "name": "test-name",
                "type": "charm",
                "private": "private",
            },
        )
        self.assertEqual(res.status_code, 302)
        self.assertIn("already_owned=True", res.headers["Location"])

    def test_register_name_dispute(self):
        res = self.client.get("/register-name-dispute?entity-name=test-name")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"Claim the name", res.data)

    def test_register_name_dispute_redirect(self):
        res = self.client.get("/register-name-dispute")
        self.assertEqual(res.status_code, 302)

    def test_register_name_dispute_thank_you_redirect(self):
        res = self.client.get("/register-name-dispute/thank-you")
        self.assertEqual(res.status_code, 302)

    def test_register_name_dispute_thank_you(self):
        res = self.client.get(
            "/register-name-dispute/thank-you?entity-name=test-name"
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn(
            b"We will process the details provided with the name dispute.",
            res.data,
        )

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.unregister_package_name"
    )
    def test_delete_package(self, mock_unregister_package_name):
        mock_unregister_package_name.return_value.status_code = 200
        res = self.client.delete("/packages/test-package")
        self.assertEqual(res.status_code, 200)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.unregister_package_name"
    )
    def test_delete_package_failed(self, mock_unregister_package_name):
        mock_unregister_package_name.return_value.status_code = 500
        mock_unregister_package_name.return_value.json = {
            "error-list": [{"message": "test-error"}]
        }
        res = self.client.delete("/packages/test-package")
        self.assertEqual(res.status_code, 500)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.create_track"
    )
    def test_post_create_track(self, mock_create_track):
        mock_create_track.return_value.status_code = 201
        mock_create_track.return_value.json = lambda: {"track": "test-track"}
        res = self.client.post(
            "/test-charm/create-track",
            data={
                "track-name": "test-track",
                "version-pattern": "v1",
                "auto-phasing-percentage": "50",
            },
        )
        self.assertEqual(res.status_code, 201)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.create_track"
    )
    def test_post_create_track_already_exists(self, mock_create_track):
        mock_create_track.return_value.status_code = 409
        mock_create_track.return_value.json = lambda: {"track": "test-track"}
        res = self.client.post(
            "/test-charm/create-track",
            data={
                "track-name": "test-track",
                "version-pattern": "v1",
                "auto-phasing-percentage": "50",
            },
        )
        self.assertEqual(res.status_code, 409)

    @patch(
        "canonicalwebteam.store_api.publishergw"
        ".PublisherGW.get_releases"
    )
    @patch("webapp.publisher.logic.process_releases")
    @patch("webapp.publisher.logic.get_all_architectures")
    def test_get_releases(
        self,
        mock_get_all_architectures,
        mock_process_releases,
        mock_get_releases,
    ):
        mock_get_releases.return_value = {
            "channel-map": [],
            "package": {"channels": []},
            "revisions": [],
        }
        mock_process_releases.return_value = []
        mock_get_all_architectures.return_value = []
        self.set_session()
        res = self.client.get("/api/packages/test-entity/releases")
        self.assertEqual(res.status_code, 200)
