from werkzeug.middleware.dispatcher import DispatcherMiddleware
from webapp_beta.beta_app import app as beta_app
from webapp.app import app as main_app


app = DispatcherMiddleware(main_app, {"/beta": beta_app})

