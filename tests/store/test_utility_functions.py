from unittest import TestCase
from unittest.mock import patch
from webapp.app import app
from webapp.store.views import extract_juju_version, process_contacts


class TestUtilityFunctions(TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_extract_juju_version(self):
        self.assertEqual(extract_juju_version(["juju >= 2.0"]), ">= 2.0")
        self.assertEqual(extract_juju_version(["some_other_assumption", "juju 3.0"]), "3.0")
        self.assertEqual(extract_juju_version(["another_assumption"]), None)
        self.assertEqual(extract_juju_version([]), None)

    def test_process_contacts(self):
        contact_list = ["Canonical <canonical@example.com>", "mailto:contact_name <contact@example.com>"]
        expected_output = [
            {"name": "Canonical", "email": "canonical@example.com"},
            {"name": "contact_name", "email": "contact@example.com"}
        ]
        self.assertEqual(process_contacts(contact_list), expected_output)

        malformed_contact_list = ["Canonical canonical@example.com"]
        self.assertEqual(process_contacts(malformed_contact_list), [])

        self.assertEqual(process_contacts([]), [])
