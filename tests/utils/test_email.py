import unittest
from unittest.mock import patch, MagicMock
from webapp.utils.emailer import Emailer, SMTPConfig, EmailerError


class TestEmailer(unittest.TestCase):
    def setUp(self):
        self.smtp_config = SMTPConfig(
            host="smtp.test.com",
            port=587,
            username="testuser@canonical.com",
            password="testpass",
            domain="example.com",
        )
        self.emailer = Emailer(self.smtp_config)

    @patch("smtplib.SMTP")
    def test_send_email_success(self, mock_smtp):
        subject = "Test subject"
        body = "Test body"
        to_email = "recipient@test.com"

        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        self.emailer.send_email(subject, body, to_email)

        mock_smtp.assert_called_once_with(
            self.smtp_config.host, self.smtp_config.port
        )
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_with(
            self.smtp_config.username, self.smtp_config.password
        )

    @patch("smtplib.SMTP")
    def test_send_email_template_success(self, mock_smtp):
        with patch("webapp.utils.emailer.render_template") as mock_render:
            mock_render.return_value = "<h1>Hello</h1>"
            mock_server = MagicMock()
            mock_smtp.return_value.__enter__.return_value = mock_server

            self.emailer.send_email_template(
                to_email="recipient@test.com",
                subject="Test Template",
                template_path="template.html",
                context={"name": "Test"},
            )

            mock_render.assert_called_once_with(
                "template.html", **{"name": "Test"}
            )
            mock_server.send_message.assert_called()

    def test_validate_config_missing_fields(self):
        incomplete_config = SMTPConfig(
            host=None,
            port=587,
            username=None,
            password=None,
            domain="example.com",
        )
        emailer = Emailer(incomplete_config)
        self.assertFalse(emailer.is_configured)

    @patch("smtplib.SMTP")
    def test_send_raises_smtp_exception(self, mock_smtp):
        mock_smtp.side_effect = Exception("SMTP failure")
        subject = "Test"
        body = "Body"
        to_email = "to@example.com"

        with self.assertRaises(EmailerError):
            self.emailer._send(subject, body, to_email)

    def test_create_message_addresses(self):
        message = self.emailer._create_message(
            subject="Subject",
            body="Body",
            to_email=["a@test.com", "b@test.com"],
        )
        self.assertIn("From", message)
        self.assertIn("To", message)
        self.assertEqual(message["From"], "testuser@canonical.com")

        emailer2 = Emailer(
            SMTPConfig(
                host="host",
                port=587,
                username="simpleuser",
                password="pass",
                domain="example.com",
            )
        )
        message2 = emailer2._create_message(
            "Sub", "Body", "someone@example.com"
        )
        self.assertTrue(message2["From"].startswith("noreply+"))

    def test_send_email_no_configuration(self):
        no_config = SMTPConfig(
            host=None,
            port=587,
            username=None,
            password=None,
            domain="example.com",
        )
        emailer = Emailer(no_config)
        emailer.send_email("subject", "body", "to@example.com")
        self.assertFalse(emailer.is_configured)
