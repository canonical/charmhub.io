# This file serves as an entry point for the rock image. It is required by the PaaS app charmer.
# The flask application must be defined in this file under the variable name `app`.
# See - https://documentation.ubuntu.com/rockcraft/en/latest/reference/extensions/flask-framework/
from webapp.app import app
