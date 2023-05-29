import re
import time
from github import Github
from os import getenv

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
        inter = [
            i
            for i in interfaces
            if i["status"].lower() == status
        ]
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

    def get_interface_cont_from_repo(self, interface, status, content_type):
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
            response = yaml.load(cont)
            # if there is no charm
        else:
            response = {"providers": [], "consumers": []}

        return response

    def find_between(self, s, first, last):
        try:
            start = s.index(first) + len(first)
            end = s.index(last, start)
            return s[start:end]
        except ValueError:
            return ""

    def extract_table_from_markdown(self, readme_markdown: str) -> str:
        """
        extracts the first table in a markdown and returns it as a string
        """
        regex = r"\|.*\|\n\|.*\|.*\|\n(\|.*\|.*\|\n)+"

        table_match = re.search(regex, readme_markdown)
        table_str = table_match.group(0)
        return table_str

    def get_interfaces_from_readme(self, readme):
        """
        This function will return a list of interfaces from
        a Markdown table.
        """

        table_content = self.extract_table_from_markdown(readme)
        lines = table_content.split("\n")
        data = []
        keys = []
        # Get data from table
        for index, line in enumerate(lines):
            if "----" in line or line == "":
                continue
            elif index == 0:
                keys = [
                    _i.strip().lower().replace(" ", "_")
                    for _i in line.split("|")
                ]
            else:
                data.append(
                    {
                        keys[_i]: v.strip()
                        for _i, v in enumerate(line.split("|"))
                        if _i > 0 and _i < len(keys) - 1
                    }
                )

        interfaces = []

        # Curate data for the interface
        category_cache = ""
        for interface in data:
            name_data = interface["interface"]

            if "[" in name_data:
                name = self.find_between(name_data, "[", "]").replace("`", "")
                readme_path = self.find_between(name_data, "(", ")")
            else:
                name = name_data
                readme_path = None

            version = None

            if "/" in name:
                splitted_name = name.split("/")
                version = splitted_name[1].replace("v", "")
                name = splitted_name[0]

            if not version and readme_path:
                version = readme_path.split("/")[2].replace("v", "")

            if "live" in interface["status"].lower():
                status = "Live"
            else:
                status = "Draft"

            if interface["category"]:
                category = interface["category"]
                category_cache = category
            else:
                category = category_cache

            interfaces.append(
                {
                    "name": name,
                    "readme_path": readme_path,
                    "version": version,
                    "status": status,
                    "category": category,
                }
            )

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
