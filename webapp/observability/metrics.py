from typing import Optional, Dict
from time import time
from contextlib import contextmanager
import functools
import logging
import time
import statsd

logger = logging.getLogger(__name__)

class Metric():
    """Abstraction over prometheus and statsd metrics."""

    def __init__(self, name, statsd_template: Optional[str] = None):
        self.name = name
        self.statsd_template = statsd_template
        self._client = statsd.StatsClient('localhost', 9125)


    def _format_name(self, labels: Dict[str, str]) -> str:
        name = self.name.replace('_', '.')
        if self.statsd_template:
            try:
                name = self.statsd_template.format(name=name, **labels)
            except Exception:
                pass
        return name


def _safe_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception:
            logger.exception(f"Failed to call metric {func.__name__}")
    return wrapper

class Counter(Metric):
    @_safe_call
    def inc(self, amount: int = 1, **labels: str):
        name = self._format_name(labels)
        self._client.incr(name, amount)

class Histogram(Metric):
    @_safe_call
    def observe(self, amount: float, **labels: str):
        """Amount in milliseconds"""
        name = self._format_name(labels)
        self._client.timing(name, amount)

    @contextmanager
    def time(self, **labels: str):
        start = time.time()
        try:
            yield
        finally:
            duration_ms = (time.time() - start) * 1000
            self.observe(duration_ms, **labels)

class RequestsMetrics():
    requests = Counter(
        name='wsgi_requests',
        statsd_template='{name}.{view}.{method}.{status}',
    )

    latency = Histogram(
        name='wsgi_latency',
        statsd_template='{name}.{view}.{method}.{status}',
    )

    errors = Counter(
        name='wsgi_errors',
        statsd_template='{name}.{view}.{method}.{status}',
    )
