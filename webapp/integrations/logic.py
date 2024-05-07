import re
import time
from github import Github
from os import getenv

import requests
from mistune import html

from webapp.helpers import get_soup, get_yaml_loader

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
            or time.time() - self.last_fetch > 3600
        ):
            readme = self.repo.get_contents(
                "README.md"
            ).decoded_content.decode("utf-8")
            # the readme fetched here is for all interfaces
            self.interfaces = self.get_interfaces_from_readme(readme)
            self.last_fetch = time.time()

        return self.interfaces

    def get_interface_list(self, interface):
        """
        return all versions of a particular interface from the interfaces list
        """
        interfaces = self.get_interfaces()
        return [i for i in interfaces if i["name"] == interface]

    def get_interface_status(self, interface, status):
        interfaces = self.get_interface_list(interface)
        inter = [i for i in interfaces if i["status"].lower() == status]
        return inter

    def get_interface_latest_version(self, interface, status):
        interface_has_status = self.get_interface_status(interface, status)
        if interface_has_status:
            latest_version = min(
                interface_has_status, key=lambda x: x["version"]
            )
            return latest_version["version"]
        else:
            return None

    def get_interface_cont_from_repo(
        self, interface, status, content_type, version=None
    ):
        if version is None:
            version = self.get_interface_latest_version(interface, status)

        interface_path = "interfaces/{}/v{}".format(interface, version)
        interface_content = self.repo.get_contents(interface_path)

        content = [
            path
            for path in interface_content
            if path.path.endswith(content_type)
        ]
        return content

    def get_interface_yml(self, interface, status):
        content = self.get_interface_cont_from_repo(
            interface, status, "charms.yaml"
        )
        if content:
            cont = content[0].decoded_content.decode("utf-8")
            charms = yaml.load(cont)
            active_providers = []
            active_requirers = []
            url = "https://charmhub.io/"
            if "providers" in charms and charms["providers"]:
                for provider in charms["providers"]:
                    try:
                        p = requests.get(f"{url}/{provider['name']}")
                        if p.status_code != 404:
                            active_providers.append(provider)
                    except Exception:
                        continue

                charms["providers"] = active_providers
            if "requirers" in charms and charms["requirers"]:
                for requirer in charms["requirers"]:
                    try:
                        c = requests.get(f"{url}/{requirer['name']}")
                        if c.status_code != 404:
                            active_requirers.append(requirer)
                    except Exception:
                        continue
                charms["requirers"] = active_requirers

        else:
            charms = {"providers": [], "requirers": []}
        return charms

    def find_between(self, s, first, last):
        try:
            start = s.index(first) + len(first)
            end = s.index(last, start)
            return s[start:end]
        except ValueError:
            return ""

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

    def get_interfaces_from_path(self):
        interface_paths = self.repo.get_contents("interfaces")

        interfaces = []
        for i, row in enumerate(interface_paths):
            path = row.path.replace("interfaces/", "")
            if row.type == "dir" and not path.startswith("__"):
                interface = {}
                interface["name"] = path
                interface["readme_path"] = (
                    "https://github.com/canonical/charm-relation-interfaces/"
                    + row.path
                    + "/README.md"
                )
                interface["status"] = "draft"
                interfaces.append(interface)

        return interfaces

    def get_interfaces_from_readme(self, readme):
        return None
        html_text = get_soup(html(readme))
        interface_table = html_text.find("table")

        interfaces = []
        for i, row in enumerate(interface_table.find_all("tr")):
            if i == 0:
                keys = [th.text.lower() for th in row.find_all("th")]
            else:
                interface = {}
                for j, key in enumerate(keys):
                    cols = row.find_all("td")
                    if key == "interface":
                        interface["name"] = cols[j].text
                    else:
                        interface[key] = cols[j].text
                    interface["readme_path"] = cols[1].find("a")["href"]
                    interface["status"] = (
                        cols[2].find("img")["alt"].split(":")[1].strip()
                    )
                if interface:
                    interfaces.append(interface)

        # Curate data for the interface
        category_cache = ""
        for interface in interfaces:
            name_data = interface["name"]
            version = None

            if "/" in name_data:
                splitted_name = name_data.split("/")
                version = splitted_name[1].replace("v", "")
                interface["name"] = splitted_name[0]

            if not version and interface["readme_path"]:
                version = (
                    interface["readme_path"].split("/")[2].replace("v", "")
                )
            interface["version"] = version

            if interface["category"]:
                category = interface["category"]
                category_cache = category
            else:
                interface["category"] = category_cache

        return interfaces

    def filter_interfaces_by_status(self, status):
        interfaces = self.get_interfaces()
        return list(
            filter(lambda item: (item["status"] == status), interfaces)
        )

    def strip_str(self, string):
        return re.sub(r"[^a-zA-Z0-9 ().,!-_/:;`]", "", string)

    def get_short_description_from_readme(self, readme):
        lines = readme.split("\n")

        for line in lines:
            if line and line[0].isalpha():
                return line

        return None

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

    def get_schema_url(self, interface, version, schema):
        base_link = (
            "{}https://github.com/canonical/"
            "charm-relation-interfaces/blob/main/interfaces/{}/v{}"
        ).format("(", interface, version)
        return base_link.join(schema.split("(."))

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
