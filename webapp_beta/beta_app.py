import talisker.requests
from canonicalwebteam.store_base.app import create_app
from canonicalwebteam.store_api.stores.charmstore import (
    CharmStore,
    CharmPublisher,
)
from canonicalwebteam.candid import CandidClient

from webapp_beta.charmhub_bp import charmhub_bp
from webapp.decorators import login_required
from webapp.handlers import charmhub_utility_processor
from webapp.decorators import login_required

# beta charmhub configiuration
app = create_app(
    "charmhub_beta",
    login_required,
    store_bp=charmhub_bp,
    utility_processor=charmhub_utility_processor,
)

app.name = "charmhub_beta"
app.static_folder = charmhub_bp.static_folder
app.template_folder = charmhub_bp.template_folder
app.static_url_path = charmhub_bp.static_url_path
app.store_api = CharmStore(session=talisker.requests.get_session())


request_session = talisker.requests.get_session()
candid = CandidClient(request_session)
publisher_api = CharmPublisher(request_session)
