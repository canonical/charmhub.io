from typing import List, Union
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from collections import namedtuple
import logging
from flask import render_template
from threading import Thread

SMTPConfig = namedtuple(
    "SMTPConfig", ["host", "port", "username", "password", "domain"]
)

logger = logging.getLogger("emailer")


class EmailerError(Exception):
    """Custom exception for emailer errors"""

    pass


class Emailer:
    def __init__(self, smtp_config: SMTPConfig):
        self.smtp_config = smtp_config
        self.is_configured = self._validate_config()

        if self.is_configured:
            logger.info("Emailer initialized with SMTP configuration.")
        else:
            logger.warning(
                "Emailer disabled: "
                "SMTP configuration is missing or incomplete. "
                "Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment"
                " variables to enable email sending."
            )

    def _validate_config(self) -> bool:
        if not self.smtp_config:
            return False

        return all(
            [
                self.smtp_config.host,
                self.smtp_config.username,
                self.smtp_config.password,
            ]
        )

    def _create_message(
        self,
        subject: str,
        body: str,
        to_email: str | List[str],
        body_type: str = "plain",
    ) -> MIMEMultipart:
        """Create email message with proper headers"""
        msg = MIMEMultipart()
        # if username has the email format, use it as the sender
        if "@" in self.smtp_config.username:
            msg["From"] = self.smtp_config.username
        else:
            msg["From"] = (
                f"noreply+{self.smtp_config.username}@{self.smtp_config.domain}"
            )
        msg["Subject"] = subject

        if isinstance(to_email, list):
            msg["To"] = ", ".join(to_email)
        else:
            msg["To"] = to_email
        msg.attach(MIMEText(body, body_type))
        return msg

    def _send(
        self,
        subject: str,
        body: str,
        to_email: Union[str, List[str]],
        body_type: str = "plain",
    ):
        if not self.is_configured:
            return
        try:
            msg = self._create_message(subject, body, to_email, body_type)

            with smtplib.SMTP(self.smtp_config.host, self.smtp_config.port) as server:
                server.starttls()
                server.login(self.smtp_config.username, self.smtp_config.password)

                to_addrs = to_email if isinstance(to_email, list) else [to_email]
                server.send_message(msg, to_addrs=to_addrs)

        except smtplib.SMTPException as e:
            logger.error(f"SMTP error occurred: {e}")
            raise EmailerError(f"Failed to send email: SMTP error - {e}")
        except Exception as e:
            logger.error(f"Unexpected error sending email: {e}")
            raise EmailerError(f"Failed to send email: {e}")

    def send_email(self, subject: str, body: str, to_email: Union[str, List[str]]):
        Thread(target=self._send, args=(subject, body, to_email)).start()

    def send_email_template(
        self, to_email: str, subject: str, template_path: str, context: dict
    ):
        body = render_template(template_path, **context)
        Thread(target=self._send, args=(subject, body, to_email, "html")).start()


smtp_config = SMTPConfig(
    host=os.getenv("SMTP_HOST", None),
    port=int(os.getenv("SMTP_PORT", 587)),
    username=os.getenv("SMTP_USER", None),
    password=os.getenv("SMTP_PASSWORD", None),
    domain=os.getenv("SMTP_DOMAIN", "canonical.com"),
)


def get_emailer() -> Emailer:
    smtp_config = SMTPConfig(
        host=os.getenv("SMTP_HOST", None),
        port=int(os.getenv("SMTP_PORT", 587)),
        username=os.getenv("SMTP_USER", None),
        password=os.getenv("SMTP_PASSWORD", None),
        domain=os.getenv("SMTP_DOMAIN", "canonical.com"),
    )
    return Emailer(smtp_config=smtp_config)
