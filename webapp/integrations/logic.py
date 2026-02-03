import re
from github import Github
from os import getenv

from redis_cache.cache_utility import redis_cache
from webapp.helpers import get_yaml_loader
from webapp.observability.utils import trace_function
from webapp.packages.logic import (
    get_package,
)
import logging

logger = logging.getLogger(__name__)

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)
yaml = get_yaml_loader()


class Interfaces:
    def __init__(self):
        self._repo = None

    @property
    def repo(self):
        if self._repo is None:
            self._repo = github_client.get_repo("canonical/charmlibs")
        return self._repo

    @trace_function
    def get_interfaces(self):
        key = "get-interfaces"
        interfaces = redis_cache.get(key, expected_type=list)
        if interfaces:
            return interfaces
        try:
            index = self.repo.get_contents("interfaces/index.json")
            if isinstance(index, list):
                index = index[0]
            index_content = index.decoded_content.decode("utf-8")
            interfaces = yaml.load(index_content)
            redis_cache.set(key, interfaces, ttl=86400)
            return interfaces
        except Exception:
            return []

    @trace_function
    def get_interface_from_path(self, interface_name):
        key = f"get-interface-from-path:{interface_name}"
        interface = redis_cache.get(key, expected_type=dict)
        if interface:
            return interface
        try:
            interface_versions = self.repo.get_contents(
                "interfaces/{}/interface".format(interface_name)
            )

        except Exception as e:
            logger.warning(f"Interface {interface_name} not found: {e}")
            return None

        versions = []
        if not isinstance(interface_versions, list):
            interface_versions = [interface_versions]
        for _, version in enumerate(interface_versions):
            if version.type == "dir" and version.name.startswith("v"):
                versions.append(version.name)

        versions.sort()

        latest_version = versions.pop()

        latest_version_interface = self.repo.get_contents(
            "interfaces/{}/interface/{}/interface.yaml".format(
                interface_name, latest_version
            )
        ).decoded_content.decode("utf-8")
        interface = yaml.load(latest_version_interface)

        active_providers = []
        active_requirers = []

        if "providers" in interface and interface["providers"]:
            active_providers = []
            for provider in interface["providers"]:
                try:
                    get_package(provider["name"], [], False)
                    active_providers.append(provider)
                except Exception:
                    continue
            interface["providers"] = active_providers

        if "requirers" in interface and interface["requirers"]:
            active_requirers = []
            for requirer in interface["requirers"]:
                try:
                    get_package(requirer["name"], [], False)
                    active_requirers.append(requirer)
                except Exception:
                    continue
            interface["requirers"] = active_requirers
        redis_cache.set(key, interface, ttl=86400)
        return interface

    @trace_function
    def get_h_content(self, text, pattern):
        start_index = text.index(pattern)
        return [start_index, start_index + len(pattern)]

    @trace_function
    def extract_headings_and_content(self, text, level):
        headings = re.findall(r"^#{" + str(level) + r"}\s.*", text, flags=re.MULTILINE)

        start_end = {heading: self.get_h_content(text, heading) for heading in headings}
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

    @trace_function
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

    @trace_function
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

            result = self.convert_readme(interface, version, content, level + 1)

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

    @trace_function
    def get_interface_name_from_readme(self, text):
        name = re.sub(r"[#` \n]", "", text.split("\n##", 1)[0]).split("/")[0]
        return name


interface_logic = Interfaces()
