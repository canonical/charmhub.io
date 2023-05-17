import re
from github import Github
from os import getenv

from webapp.helpers import get_yaml_loader

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)
repo = github_client.get_repo("canonical/charm-relation-interfaces")
yaml = get_yaml_loader()


class Interfaces:
    def get_interface_status(self, interfaces, interface, status):
        inter = [
            i
            for i in interfaces
            if i["name"] == interface and i["status"].lower() == status
        ]
        return inter

    def get_interface_latest_version(self, interfaces, interface, status):
        interface_has_status = self.get_interface_status(
            interfaces, interface, status
        )
        if interface_has_status:
            latest_version = min(
                interface_has_status, key=lambda x: x["version"]
            )
            return latest_version["version"]
        else:
            return None

    def get_interface_cont_from_repo(
        self, interfaces, interface, status, content_type
    ):
        version = self.get_interface_latest_version(
            interfaces, interface, status
        )
        interface_path = "interfaces/{}/v{}".format(interface, version)
        interface_content = repo.get_contents(interface_path)

        content = [
            path
            for path in interface_content
            if path.path.endswith(content_type)
        ]
        return content

    def get_interface_yml(self, interfaces, interface, status):
        content = self.get_interface_cont_from_repo(
            interfaces, interface, status, "charms.yaml"
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

    def filter_interfaces_by_status(self, interfaces, status):
        return list(
            filter(lambda item: (item["status"] == status), interfaces)
        )

    def get_short_description_from_readme(self, readme):
        lines = readme.split("\n")

        for line in lines:
            if line and line[0].isalpha():
                return line

        return None

    def strip_str(self, string):
        return re.sub(r"[^a-zA-Z0-9 ().,!-_/:;`]", "", string)

    def get_h_content(self, text, pattern):
        start_index = text.index(pattern)
        return [start_index, start_index + len(pattern)]

    def extract_text(self, text, delimiter):
        headings = re.findall(f"{delimiter}" + r"\s\S+", text)
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
            "charm-relation-interfaces/blob/main/interfaces/{}/{}"
        ).format("(", interface, version)
        return base_link.join(schema.split("(."))

    def convert_readme(self, interface, version, text, level=2):
        headings_and_contents = self.extract_text(text, "\n" + ("#" * level))

        if len(headings_and_contents) == 0:
            return [s.strip("\n") for s in text.split("\n") if s.strip("\n")]
        resulting_dict = {}

        for heading, content in headings_and_contents:
            strip_char = "{}{}".format("#" * level, " ")
            heading = heading.strip(strip_char)
            temp = {}

            if content[0].isalpha and "#" in content:
                temp[heading] = self.convert_readme(
                    interface, version, content, level + 1
                )
                resulting_dict.update(temp)

                if len(content.split("\n\n", 1)) > 1:
                    intro = content.split("\n\n", 1)[0]

                    if heading == "Requirer" or heading == "Provider":
                        schema_link = self.get_schema_url(
                            interface, version, intro
                        )
                        resulting_dict[heading]["Introduction"] = schema_link
                    elif not heading == "Relation":
                        resulting_dict[heading]["Introduction"] = intro

                else:
                    resulting_dict[heading] = self.convert_readme(
                        interface, version, content, level + 1
                    )

            else:
                resulting_dict[heading] = self.convert_readme(
                    interface, version, content, level + 1
                )

        return resulting_dict

    def get_interface_name_from_readme(self, text):
        name = re.sub(r"[#` \n]", "", text.split("\n##", 1)[0]).split("/")[0]
        return name
