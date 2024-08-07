import os

# canonicalwebteam.flask-base requires SECRET_KEY to be set, this must be done before importing the app
os.environ["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]

from webapp.app import app
