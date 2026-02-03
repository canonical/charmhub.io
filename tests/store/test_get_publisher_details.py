from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
from webapp.helpers import get_soup

api_publisher_response = {
    "results": [
        {
            "id": "3uPxmv77o1PrixpQFIf8o7SkOLsnMWmZ",
            "name": "kafka",
            "type": "charm",
            "result": {
                "deployable-on": [],
                "description": "Apache Kafka is ...",
                "media": [
                    {
                        "height": None,
                        "type": "icon",
                        "url": "https://icon-url.com/path/icon.png",
                        "width": None,
                    }
                ],
                "publisher": {
                    "display-name": "Canonical",
                    "id": "gVVkuxw4C56POG1eszt4RPR3L5Eak8XE",
                    "username": "data-platform",
                    "validation": "unproven",
                },
                "summary": "Charmed Apache Kafka Operator",
                "title": "Apache Kafka",
            },
        }
    ]
}


class TestGetPublisherDetails(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    @patch("webapp.store_api.device_gateway.find")
    def test_get_publisher_details(self, mock_find):
        mock_find.return_value = api_publisher_response
        response = self.client.get("/publisher/data-platform")
        main_content = get_soup(response.text).body.find(
            "main", attrs={"id": "main-content"}
        )
        self.assertEqual(response.status_code, 200)
        self._assert_heading_section(main_content, "Canonical")
        self._assert_content_section(
            main_content,
            {
                "message": "Showing 1 item",
                "cards_num": 1,
                "cards": [
                    {
                        "title": "Apache Kafka",
                        "publisher": "Canonical",
                        "summary": "Charmed Apache Kafka Operator",
                    }
                ],
            },
        )

    @patch("webapp.store_api.device_gateway.find")
    def test_get_publisher_details_empty_response(self, mock_find):
        mock_find.return_value = {"results": []}
        response = self.client.get("/publisher/test-publisher")
        main_content = get_soup(response.text).body.find(
            "main", attrs={"id": "main-content"}
        )
        self.assertEqual(response.status_code, 200)
        self._assert_heading_section(main_content, "test-publisher")
        self._assert_content_section(
            main_content,
            {"message": "No items found", "cards_num": 0, "cards": []},
        )

    @patch("webapp.store_api.device_gateway.find")
    def test_get_publisher_details_exception(self, mock_find):
        mock_find.side_effect = Exception("Service Unavailable")
        with self.assertRaises(Exception) as context:
            response = self.client.get("/publisher/test-publisher")
            self.assertEqual(str(context.exception), "Service Unavailable")
            self.assertEqual(response.status_code, 500)

    def _assert_heading_section(self, content, expected_publisher):
        # back to all charms is present and linked
        all_charms_elem = content.css.select(
            ".p-strip--dark > .u-fixed-width a"
        )[0]
        self.assertEqual(all_charms_elem.text, "< All charms")
        self.assertEqual(all_charms_elem.get("href"), "/")
        # publisher name title is present and equal
        publisher_elem = content.css.select(
            ".p-strip--dark > .u-fixed-width .p-heading--2"
        )[0]
        self.assertEqual(publisher_elem.text, expected_publisher)

    def _assert_content_section(self, content, expected_values):
        # message is present and correct
        message_elem = content.css.select(".p-strip > .row > p")[0]
        self.assertEqual(message_elem.text, expected_values["message"])
        # list of cards with published charms present with all items
        card_elements = content.css.select(".p-strip > .row .p-card")
        self.assertEqual(len(card_elements), expected_values["cards_num"])
        for index, card_elem in enumerate(card_elements):
            self._assert_card(card_elem, expected_values["cards"][index])

    def _assert_card(self, content, expected_values):
        title_elem = content.css.select("h2")[0]
        self.assertEqual(title_elem.text.strip(), expected_values["title"])
        publisher_elem = content.css.select(".u-text--muted em")[0]
        self.assertEqual(
            publisher_elem.text.strip(), expected_values["publisher"]
        )
        summary_elem = content.css.select("p.u-line-clamp")[0]
        self.assertEqual(summary_elem.text.strip(), expected_values["summary"])
