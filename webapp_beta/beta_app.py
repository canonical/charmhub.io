from flask import request
import talisker.requests
from canonicalwebteam.store_base.app import create_app
from canonicalwebteam.store_api.stores.charmstore import CharmStore, CharmPublisher
from canonicalwebteam.candid import CandidClient
from canonicalwebteam.store_base.handlers import set_handlers

from webapp.topics.views import topics
from webapp_beta.charmhub_bp import charmhub_bp
from webapp_beta.publisher.views import publisher
from webapp_beta.store.views import store
from webapp_beta.auth.views import auth
# from webapp.interfaces.views import interfaces
from webapp.handlers import charmhub_utility_processor

# beta charmhub configiuration
app = create_app(
    "charmhub_beta",
    store_bp=charmhub_bp,
    utility_processor=charmhub_utility_processor,
)

app.name = "charmhub_beta"
app.static_folder=charmhub_bp.static_folder
app.template_folder=charmhub_bp.template_folder
app.static_url_path=charmhub_bp.static_url_path
app.store_api = CharmStore(session=talisker.requests.get_session())

# set_handlers(app, charmhub_utility_processor)

app.register_blueprint(publisher)
app.register_blueprint(store)
app.register_blueprint(auth)


request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)
