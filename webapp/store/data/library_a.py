# Copyright 2020 Canonical Ltd.
# Licensed under the Apache License, Version 2.0; see LICENCE file for details.

import http.client
import json
import logging
import ssl
import sys

from .version import version as __version__  # noqa: F401 (imported but unused)

__all__ = ("get_pod_status", "APIServer", "PodStatus")

logger = logging.getLogger()


def get_pod_status(juju_model, juju_app, juju_unit):
    """Left to not break people, but you should probably just do
    `PodStatus.for_charm()` instead."""
    return PodStatus.fetch(juju_model, juju_app, juju_unit)


class APIServer:
    """
    Wraps the logic needed to access the k8s API server from inside a pod.
    It does this by reading the service account token which is mounted onto
    """

    _SERVICE_ACCOUNT_CA = (
        "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
    )
    _SERVICE_ACCOUNT_TOKEN = (
        "/var/run/secrets/kubernetes.io/serviceaccount/token"
    )

    def get(self, path):
        return self.request("GET", path)

    def request(self, method, path):
        with open(
            self._SERVICE_ACCOUNT_TOKEN, "rt", encoding="utf8"
        ) as token_file:
            kube_token = token_file.read()

        # drop this when dropping support for 3.5
        if sys.version_info < (3, 6):
            ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
        else:
            ssl_context = ssl.SSLContext()

        ssl_context.load_verify_locations(self._SERVICE_ACCOUNT_CA)

        headers = {"Authorization": "Bearer {}".format(kube_token)}

        host = "kubernetes.default.svc"
        conn = http.client.HTTPSConnection(host, context=ssl_context)
        logger.debug("%s %s/%s", method, host, path)
        conn.request(method=method, url=path, headers=headers)
        response = conn.getresponse()
        logger.debug("%s %s/%s done: %s", method, host, path, response.status)

        return json.load(response)


class PodStatus(dict):
    @classmethod
    def for_charm(cls, charm):
        """Fetch the status of the workload pod for the given charm."""
        return cls.fetch(charm.model.name, charm.app.name, charm.unit.name)

    @classmethod
    def fetch(cls, juju_model, juju_app, juju_unit):
        """Fetch the status of the pod for the given model, app and unit."""
        logger.debug(
            "getting pod status for %s/%s/%s", juju_model, juju_app, juju_unit
        )
        namespace = juju_model

        path = "/api/v1/namespaces/{}/pods?labelSelector=juju-app={}".format(
            namespace, juju_app
        )

        api_server = APIServer()
        response = api_server.get(path)

        status = cls()
        try:
            if response["kind"] == "PodList":
                for item in response["items"]:
                    if (
                        item["metadata"]["annotations"]["juju.io/unit"]
                        == juju_unit
                    ):
                        status.update(item)
                        break
        except KeyError:
            pass

        return status

    @property
    def is_ready(self):
        if not self:
            return False

        try:
            for condition in self["status"]["conditions"]:
                if condition["type"] == "ContainersReady":
                    return condition["status"] == "True"
        except KeyError:
            pass

        return False

    @property
    def is_running(self):
        if not self:
            return False

        try:
            return self["status"]["phase"] == "Running"
        except KeyError:
            return False

    @property
    def is_unknown(self):
        return not self
