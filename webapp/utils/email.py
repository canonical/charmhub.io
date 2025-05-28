import smtplib
import os
from collections import namedtuple
import logging
from flask import render_template, current_app

SMTPConfig = namedtuple('SMTPConfig', ['smtp_server', 'smtp_port', 'username', 'password'])

logger = logging.getLogger("emailer")

class Emailer():
    def __init__(self, smtp_config: SMTPConfig):
        self.smtp_config = smtp_config


    def send_email(self, subject: str, body: str, to_email: str):
        try:
            with smtplib.SMTP(self.smtp_config.smtp_server, self.smtp_config.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_config.username, self.smtp_config.password)
                message = f"Subject: {subject}\n\n{body}"
                server.sendmail(self.smtp_config.username, to_email, message)
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    def send_email_template(self, to_email: str, subject: str, template_path: str, context: dict):
        try:
            with current_app.app_context():
                body = render_template(template_path, **context)
                self.send_email(to_email, subject, body)
        except Exception as e:
            logger.error(f"Failed to send email: {e}")


#load SMTP configuration from env
smtp_config = SMTPConfig(
    smtp_server=os.getenv('SMTP_SERVER', None),
    smtp_port=int(os.getenv('SMTP_PORT', 587)),
    username=os.getenv('SMTP_USER', None),
    password=os.getenv('SMTP_PASSWORD', None)
)

emailer = Emailer(smtp_config=smtp_config)
