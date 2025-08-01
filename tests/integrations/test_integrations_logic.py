import unittest
from unittest.mock import MagicMock, patch
from types import SimpleNamespace as Data
from webapp.integrations.logic import Interfaces

mock_interface_yaml = """
name: prometheus_scrape

version: 0
status: published

providers:
  - name: prometheus-k8s
    url: https://www.github.com/canonical/prometheus-k8s-operator
  - name: loki-k8s
    url: https://www.github.com/canonical/loki-k8s-operator
  - name: grafana-k8s
    url: https://www.github.com/canonical/grafana-k8s-operator
  - name: prometheus-scrape-config-k8s
    url: https://www.github.com/canonical/prometheus-scrape-config-k8s-operator
  - name: prometheus-scrape-target-k8s
    url: https://www.github.com/canonical/prometheus-scrape-target-k8s-operator
  - name: alertmanager-k8s
    url: https://www.github.com/canonical/alertmanager-k8s-operator
  - name: zinc-k8s
    url: https://github.com/jnsgruk/zinc-k8s-operator

requirers:
  - name: prometheus-k8s
    url: https://www.github.com/canonical/prometheus-k8s-operator
  - name: grafana-agent-k8s
    url: https://www.github.com/canonical/grafana-agent-k8s-operator
"""

mock_interface = {
    "name": "prometheus_scrape",
    "version": 0,
    "status": "published",
    "providers": [
        {
            "name": "prometheus-k8s",
            "url": "https://www.github.com/canonical/prometheus-k8s-operator",
        },
        {
            "name": "loki-k8s",
            "url": "https://www.github.com/canonical/loki-k8s-operator",
        },
        {
            "name": "grafana-k8s",
            "url": "https://www.github.com/canonical/grafana-k8s-operator",
        },
        {
            "name": "prometheus-scrape-config-k8s",
            "url": "https://www.github.com/canonical"
            "/prometheus-scrape-config-k8s-operator",
        },
        {
            "name": "prometheus-scrape-target-k8s",
            "url": "https://www.github.com/canonical"
            "/prometheus-scrape-target-k8s-operator",
        },
        {
            "name": "alertmanager-k8s",
            "url": "https://www.github.com/canonical"
            "/alertmanager-k8s-operator",
        },
        {
            "name": "zinc-k8s",
            "url": "https://github.com/jnsgruk/zinc-k8s-operator",
        },
    ],
    "requirers": [
        {
            "name": "prometheus-k8s",
            "url": "https://www.github.com/canonical/prometheus-k8s-operator",
        },
        {
            "name": "grafana-agent-k8s",
            "url": "https://www.github.com/canonical"
            "/grafana-agent-k8s-operator",
        },
    ],
}


class TestInterfaces(unittest.TestCase):
    @patch("webapp.integrations.logic.github_client")
    def setUp(self, mock_github_client):
        self.github_client = mock_github_client
        mock_github_client.get_repo = MagicMock()
        self.repo = MagicMock()
        mock_github_client.get_repo.return_value = self.repo
        self.interfaces = Interfaces()

    def test_get_h_content(self):
        self.assertEqual(self.interfaces.get_h_content("abcd", "abc"), [0, 3])
        self.assertRaises(
            ValueError, self.interfaces.get_h_content, "abcd", "xyz"
        )

    @patch("requests.get")
    def test_get_interface_from_path(self, requests_get):
        interface_name = "test_interface"

        requests_get.return_value = MagicMock()
        requests_get.return_value.status_code = 200

        interface_versions = [
            Data(type="dir", name="v1"),
            Data(type="dir", name="v2"),
            Data(type="dir", name="v3"),
        ]
        self.repo.get_contents.side_effect = (
            interface_versions,
            Data(decoded_content=mock_interface_yaml.encode("utf-8")),
        )

        result = self.interfaces.get_interface_from_path(interface_name)

        self.repo.get_contents.assert_called_with(
            "interfaces/test_interface/v3/interface.yaml"
        )

        self.assertEqual(result, mock_interface)

    def test_get_interface_from_path_no_versions(self):
        interface_name = "test_interface"

        interface_versions = []
        self.repo.get_contents.side_effect = (interface_versions,)

        self.assertRaises(
            IndexError, self.interfaces.get_interface_from_path, interface_name
        )

    def test_get_interface_from_path_no_interface(self):
        interface_name = "test_interface"

        self.repo.get_contents.side_effect = Exception

        self.assertRaises(
            Exception, self.interfaces.get_interface_from_path, interface_name
        )

    @patch("requests.get")
    def test_get_interface_from_path_no_active_providers(self, requests_get):
        interface_name = "test_interface"

        requests_get.return_value = MagicMock()
        requests_get.return_value.status_code = 404

        interface_versions = [
            Data(type="dir", name="v3"),
        ]
        self.repo.get_contents.side_effect = (
            interface_versions,
            Data(decoded_content=mock_interface_yaml.encode("utf-8")),
        )

        result = self.interfaces.get_interface_from_path(interface_name)

        self.repo.get_contents.assert_called_with(
            "interfaces/test_interface/v3/interface.yaml"
        )

        self.assertEqual(
            result, {**mock_interface, "providers": [], "requirers": []}
        )

    def test_get_interface_name_from_readme(self):
        readme = "# test_interface\n\n## some more content"
        self.assertEqual(
            self.interfaces.get_interface_name_from_readme(readme),
            "test_interface",
        )
