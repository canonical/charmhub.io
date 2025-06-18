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

    def __init__(self, name: str):
        self.name = name
        self._client = statsd.StatsClient('localhost', 9125)

    def _format_tags(self, labels: Dict[str, str]) -> str:
        """Convert labels into StatsD-style tag string if supported."""
        if labels:
            tag_str = ",".join(f"{key}:{value}" for key, value in labels.items())
            return f"|#{tag_str}"
        return ""

def _safe_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            logger.exception(f"Failed to call metric {func.__name__}")
    return wrapper

class Counter(Metric):
    @_safe_call
    def inc(self, amount: int = 1, **labels: str):
        tag_str = self._format_tags(labels)
        # Build raw message manually if needed
        self._client._send(f"{self.name}:{amount}|c{tag_str}")

class Histogram(Metric):
    @_safe_call
    def observe(self, amount: float, **labels: str):
        """Amount in milliseconds"""
        tag_str = self._format_tags(labels)
        self._client._send(f"{self.name}:{amount}|ms{tag_str}")

    @contextmanager
    def time(self, **labels: str):
        start = time.time()
        try:
            yield
        finally:
            duration_ms = (time.time() - start) * 1000
            self.observe(duration_ms, **labels)

class RequestsMetrics():
    requests = Counter(name='wsgi_requests')
    latency = Histogram(name='wsgi_latency')
    errors = Counter(name='wsgi_errors')
