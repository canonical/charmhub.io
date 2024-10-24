"""gunicorn configuration."""

reload = True
bind = ["0.0.0.0:8000"]
worker_class = "gevent"
accesslog = "-"
workers = 4
