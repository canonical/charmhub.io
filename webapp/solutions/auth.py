import requests
import hashlib
import hmac
import time
import os

HMAC_SECRET = os.getenv("FLASK_HMAC_SECRET_KEY")
BASE_URL = os.getenv(
    "SOLUTIONS_API_BASE", "http://solutions.staging.charmhub.io/api"
)


def login(username: str) -> str:
    if not HMAC_SECRET:
        raise ValueError("HMAC_SECRET_KEY environment variable is not set")

    timestamp = str(int(time.time()))
    msg = f"{username}|{timestamp}".encode()
    sig = hmac.new(HMAC_SECRET.encode(), msg, hashlib.blake2b).hexdigest()

    r = requests.post(
        f"{BASE_URL}/login",
        json={"username": username, "timestamp": timestamp, "signature": sig},
    )

    r.raise_for_status()
    return r.json()["token"]
