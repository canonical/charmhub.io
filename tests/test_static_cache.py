import gzip
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase, main
from unittest.mock import patch

from canonicalwebteam.flask_base.app import FlaskBase
from flask import make_response

from webapp.handlers import set_handlers


class TestStaticCache(TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.static_folder = Path(directory.name)

        environment = patch.dict(os.environ, {"SECRET_KEY": "test-only-key"})
        environment.start()
        self.addCleanup(environment.stop)
        development = patch("webapp.handlers.IS_DEVELOPMENT", False)
        development.start()
        self.addCleanup(development.stop)

        self.app = FlaskBase(
            __name__,
            "static-cache-test",
            static_folder=directory.name,
            static_url_path="/static",
        )
        self.app.testing = True
        set_handlers(self.app)
        self.client = self.app.test_client()

    def create_asset(self, filename):
        path = self.static_folder / filename
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("/* test asset */")
        return f"/static/{filename}"

    def assert_immutable(self, response):
        self.assertTrue(response.cache_control.public)
        self.assertEqual(response.cache_control.max_age, 31536000)
        self.assertTrue(response.cache_control.immutable)
        self.assertFalse(response.cache_control.no_cache)
        self.assertIn("ETag", response.headers)
        self.assertIn("X-Content-Type-Options", response.headers)

    def test_hashed_vite_javascript_and_css_are_cacheable(self):
        for filename in (
            "js/dist/vite/index--JWLOO2ir.js",
            "js/dist/vite/chunks/_commonjsHelpers--CE1G-McA.js",
            "js/dist/vite/assets/styles--vS09LPT6.css",
        ):
            with self.subTest(filename=filename):
                url = self.create_asset(filename)
                with self.client.get(url) as response:
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.data, b"/* test asset */")
                    self.assert_immutable(response)

    def test_compression_preserves_cache_policy_and_vary(self):
        filename = "js/dist/vite/index--JWLOO2ir.js"
        url = self.create_asset(filename)
        content = b"/* test asset */" * 100
        (self.static_folder / filename).write_bytes(content)

        with self.client.get(
            url, headers={"Accept-Encoding": "gzip"}
        ) as response:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["Content-Encoding"], "gzip")
            self.assertEqual(gzip.decompress(response.data), content)
            self.assertIn("Accept-Encoding", response.vary)
            self.assert_immutable(response)

    def test_head_is_cacheable(self):
        url = self.create_asset("js/dist/vite/index--JWLOO2ir.js")
        with self.client.head(url) as response:
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data, b"")
            self.assert_immutable(response)

    def test_conditional_response_preserves_cache_policy(self):
        url = self.create_asset("js/dist/vite/index--JWLOO2ir.js")
        with self.client.get(url) as response:
            etag = response.headers["ETag"]
        with self.client.get(url, headers={"If-None-Match": etag}) as response:
            self.assertEqual(response.status_code, 304)
            self.assertEqual(response.data, b"")
            self.assert_immutable(response)

    def test_unversioned_and_other_static_files_keep_existing_policy(self):
        for filename in (
            "js/dist/vite/index.js",
            "js/dist/vite/index--short.js",
            "js/dist/vite/.vite/manifest.json",
            "js/dist/vite/index--JWLOO2ir.js.map",
            "js/src/index--JWLOO2ir.js",
            "styles.css",
        ):
            with self.subTest(filename=filename):
                url = self.create_asset(filename)
                with self.client.get(url) as response:
                    self.assertEqual(response.status_code, 200)
                    self.assertTrue(response.cache_control.no_cache)
                    self.assertFalse(response.cache_control.immutable)

    def test_missing_hashed_asset_is_not_immutable(self):
        with self.client.get(
            "/static/js/dist/vite/missing--JWLOO2ir.js"
        ) as response:
            self.assertEqual(response.status_code, 404)
            self.assertFalse(response.cache_control.immutable)
            self.assertNotEqual(response.cache_control.max_age, 31536000)

    def test_development_preserves_existing_policy(self):
        url = self.create_asset("js/dist/vite/index--JWLOO2ir.js")
        with patch("webapp.handlers.IS_DEVELOPMENT", True):
            with self.client.get(url) as response:
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.cache_control.no_cache)
                self.assertFalse(response.cache_control.immutable)

    def test_non_static_routes_keep_existing_policy(self):
        @self.app.route("/")
        def index():
            return "page"

        @self.app.route("/account.json")
        def account():
            response = make_response({"account": None})
            response.headers["Cache-Control"] = "no-store"
            return response

        @self.app.route("/dynamic/<path:filename>")
        def dynamic(filename):
            response = make_response("private data")
            response.headers["Cache-Control"] = "private, no-store"
            return response

        with self.client.get("/") as response:
            self.assertEqual(response.cache_control.max_age, 60)
            self.assertFalse(response.cache_control.immutable)
        with self.client.get("/account.json") as response:
            self.assertEqual(response.headers["Cache-Control"], "no-store")
        with self.client.get(
            "/dynamic/js/dist/vite/index--JWLOO2ir.js"
        ) as response:
            self.assertTrue(response.cache_control.private)
            self.assertTrue(response.cache_control.no_store)
            self.assertFalse(response.cache_control.immutable)

    def test_static_error_response_is_not_immutable(self):
        self.create_asset("js/dist/vite/index--JWLOO2ir.js")
        with patch.object(
            self.app, "send_static_file", return_value=("", 500)
        ):
            with self.client.get(
                "/static/js/dist/vite/index--JWLOO2ir.js"
            ) as response:
                self.assertEqual(response.status_code, 500)
                self.assertFalse(response.cache_control.immutable)


if __name__ == "__main__":
    main()
