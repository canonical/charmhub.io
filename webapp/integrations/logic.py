import re
import time
from github import Github
from os import getenv

import requests

from webapp.helpers import get_yaml_loader

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)
yaml = get_yaml_loader()


class Interfaces:
    interfaces = []
    last_fetch = None
    repo = None

    def __init__(self):
        self.repo = github_client.get_repo(
            "canonical/charm-relation-interfaces"
        )

    def get_interfaces(self):
        if (
            len(self.interfaces) == 0
            or not self.last_fetch
            or time.time() - self.last_fetch > 172800
        ):
            interfaces_contents = self.repo.get_contents("interfaces")
            interfaces_table = []

            for interface in interfaces_contents:
                if interface.name.startswith("__"):
                    continue
                interface_content = self.repo.get_contents(
                    f"interfaces/{interface.name}"
                )
                for version in interface_content:
                    interface_details = {}
                    version_content = self.repo.get_contents(
                        f"interfaces/{interface.name}/{version.name}"
                    )
                    for details in version_content:
                        if details.name == "interface.yaml":
                            interface_yaml = yaml.load(
                                details.decoded_content.decode("utf-8")
                            )
                            interface_details["name"] = interface_yaml.get(
                                "name", interface.name
                            )

                            if interface_yaml.get("status") == "published":
                                interface_details["status"] = "live"
                            elif interface_yaml.get("status") == "draft":
                                interface_details["status"] = "draft"
                            interface_details["version"] = interface_yaml.get(
                                "version", version.name[1:]
                            )
                        if details.name == "README.md":
                            interface_details["readme_path"] = details.html_url
                    if interface_details.get("status", "") in [
                        "live",
                        "draft",
                    ]:
                        interfaces_table.append(interface_details)
            self.interfaces = interfaces_table
            self.last_fetch = time.time()
        return self.interfaces

    def repo_has_interface(self, interface):
        try:
            self.repo.get_contents("interfaces/{}".format(interface))
            return True
        except Exception:
            return False

    def get_interface_from_path(self, interface_name):
        interface_versions = self.repo.get_contents(
            "interfaces/{}".format(interface_name)
        )
        versions = []
        for i, version in enumerate(interface_versions):
            if version.type == "dir" and version.name.startswith("v"):
                versions.append(version.name)

        versions.sort()

        latest_version = versions.pop()

        latest_version_interface = self.repo.get_contents(
            "interfaces/{}/{}/interface.yaml".format(
                interface_name, latest_version
            )
        ).decoded_content.decode("utf-8")
        interface = yaml.load(latest_version_interface)

        active_providers = []
        active_requirers = []
        url = "https://charmhub.io/"
        if "providers" in interface and interface["providers"]:
            for provider in interface["providers"]:
                try:
                    p = requests.get(f"{url}/{provider['name']}")
                    if p.status_code != 404:
                        active_providers.append(provider)
                except Exception:
                    continue

                interface["providers"] = active_providers
        if "requirers" in interface and interface["requirers"]:
            for requirer in interface["requirers"]:
                try:
                    c = requests.get(f"{url}/{requirer['name']}")
                    if c.status_code != 404:
                        active_requirers.append(requirer)
                except Exception:
                    continue
                interface["requirers"] = active_requirers

        return interface

    def get_h_content(self, text, pattern):
        start_index = text.index(pattern)
        return [start_index, start_index + len(pattern)]

    def extract_headings_and_content(self, text, level):
        headings = re.findall(
            r"^#{" + str(level) + r"}\s.*", text, flags=re.MULTILINE
        )

        start_end = {
            heading: self.get_h_content(text, heading) for heading in headings
        }
        result = []
        for i in range(len(headings)):
            current_heading = headings[i]
            start_index = start_end[current_heading][1]
            has_next = i < len(headings) - 1
            if has_next:
                next_heading = headings[i + 1]
                end_index = start_end[next_heading][0]
                body = text[start_index:end_index]
            else:
                body = text[start_index:]

            result.append([current_heading.strip(), body.strip()])
        return result

    def parse_text(self, interface, version, text):
        base_link = (
            "https://github.com/canonical/"
            "charm-relation-interfaces/blob/main/interfaces/{}/v{}"
        ).format(interface, version)
        pattern = r"\[.*?\]\(.*?\)"
        matches = re.findall(pattern, text)

        for match in matches:
            element_pattern = r"\[(.*?)\]\((.*?)\)"
            element_match = re.search(element_pattern, match)
            if element_match:
                title = element_match.group(1)
                url = element_match.group(2)
                absolute_url = url
                if absolute_url.startswith("./"):
                    absolute_url = absolute_url.replace("./", base_link + "/")

                text = text.replace(match, f"[{title}]({absolute_url})")

        return text

    def convert_readme(self, interface, version, text, level=2):
        headings_and_contents = self.extract_headings_and_content(text, level)

        if len(headings_and_contents) == 0:
            return [s.strip("\n") for s in text.split("\n") if s.strip("\n")]

        resulting_list = []

        for heading, content in headings_and_contents:
            strip_char = "{}{}".format("#" * level, " ")
            heading = heading.strip(strip_char)
            _temp = {"heading": heading, "level": level, "children": []}

            children = []

            result = self.convert_readme(
                interface, version, content, level + 1
            )

            if len(content) > 0:
                body = content.split("#")[0].strip()
                body_list = body.split("\n\n")
                if len(list(filter(None, body_list))) > 0:
                    children += body_list

            if isinstance(result, list) and isinstance(result[0], dict):
                children += result

            for child in children:
                if isinstance(child, list):
                    _temp["children"] += child
                else:
                    _temp["children"].append(child)

            for index, child in list(enumerate(_temp["children"])):
                if isinstance(child, str):
                    _temp["children"][index] = self.parse_text(
                        interface, version, child
                    )

            resulting_list.append(_temp)

        return resulting_list

    def get_interface_name_from_readme(self, text):
        name = re.sub(r"[#` \n]", "", text.split("\n##", 1)[0]).split("/")[0]
        return name
