import unittest

from webapp.app import app
from webapp.llms import store_llm


class TestDiscoveredPages(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.pages = store_llm.pages(app)
        self.paths = {page["path"] for page in self.pages}

    def test_the_marketing_pages_are_discovered(self):
        self.assertLessEqual(
            {"/contact-us", "/integrations", "/topics"}, self.paths
        )

    def test_every_page_has_a_title_and_a_description(self):
        for page in self.pages:
            self.assertTrue(page["title"], page["path"])
            self.assertTrue(page["description"], page["path"])

    def test_titles_come_from_the_template_metadata(self):
        titles = {page["path"]: page["title"] for page in self.pages}

        self.assertEqual(titles["/contact-us"], "Contact us")
        self.assertEqual(titles["/integrations"], "Interface catalogue")
        self.assertEqual(titles["/topics"], "Topic pages")

    def test_charm_and_publisher_pages_are_left_out(self):
        for path in self.paths:
            self.assertNotIn("<", path)

        self.assertNotIn("/charms", self.paths)
        self.assertNotIn("/account/details", self.paths)

    def test_noindex_and_machine_pages_are_left_out(self):
        for path in ["/thank-you", "/account.json", "/sitemap.xml"]:
            self.assertNotIn(path, self.paths)

    def test_the_layout_default_title_lists_no_page(self):
        for page in self.pages:
            self.assertNotEqual(
                page["title"], "The Open Operator Collection", page["path"]
            )


class TestRoutes(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_llms_txt_lists_the_pages(self):
        response = self.client.get("/llms.txt")

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/plain", response.headers["Content-Type"])
        body = response.data.decode()
        self.assertTrue(body.startswith("# Charmhub\n"))
        self.assertIn("## Main pages", body)
        self.assertIn("https://charmhub.io/contact-us.md", body)
        self.assertIn("https://charmhub.io/llms-full.txt", body)

    def test_the_sitemap_lists_the_same_pages(self):
        body = self.client.get("/sitemap-links.xml").data.decode()

        for path in store_llm.sitemap_paths(app):
            self.assertIn(f"{path}</loc>", body)

    def test_suffix_serves_markdown(self):
        for path in ["/index.md", "/contact-us.md", "/topics.md"]:
            response = self.client.get(path)

            self.assertEqual(response.status_code, 200, path)
            self.assertIn("text/markdown", response.content_type, path)

    def test_pages_are_still_html_without_the_suffix(self):
        response = self.client.get("/contact-us")

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/html", response.content_type)

    def test_pages_behind_login_have_no_markdown_version(self):
        for path in ["/charms.md", "/account/details.md"]:
            self.assertEqual(self.client.get(path).status_code, 404, path)

    def test_the_markdown_link_follows_the_spec(self):
        links = {
            "/": "https://charmhub.io/index.md",
            "/contact-us": "https://charmhub.io/contact-us.md",
        }

        for path, href in links.items():
            body = self.client.get(path).data.decode()

            self.assertIn(
                f'<link rel="alternate" type="text/markdown" href="{href}"',
                body,
            )
            self.assertIn(
                '<link rel="describedby" href="https://charmhub.io/llms.txt"',
                body,
            )

    def test_content_anchor_is_present_on_every_page(self):
        for path in ["/", "/contact-us", "/topics"]:
            body = self.client.get(path).data.decode()

            self.assertEqual(
                body.count('id="main-content"'),
                1,
                f"{path} needs exactly one content anchor",
            )
