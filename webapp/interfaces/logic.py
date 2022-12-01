import re
from github import Github
from os import getenv

GITHUB_TOKEN = getenv("GITHUB_TOKEN")

github_client = Github(GITHUB_TOKEN)


def get_interface_cont_from_repo(interface, version, content_type):
    repo = github_client.get_repo("canonical/charm-relation-interfaces")
    interface_path = "interfaces/{}/{}".format(interface, version)
    interface_content = repo.get_contents(interface_path)
    content = [
        path for path in interface_content if path.path.endswith(content_type)
    ]
    return content


def get_interface_yml(interface, version):
    content = get_interface_cont_from_repo(interface, version, "charms.yaml")
    if content:
        cont = content[0].decoded_content.decode("utf-8")
        response = get_dict_from_yaml(cont)
    # if there is no charm
    else:
        response = {"providers": [], "consumers": []}

    return response


def get_dict_from_yaml(content):
    content_list = content.split("\n")
    result = {"providers": [], "consumers": []}
    for cont in content_list:
        if ":" in cont:
            key = re.sub(r"[^a-zA-Z0-9-]", "", cont)
        else:
            stripped_cont = cont.strip("- ")
            if stripped_cont:
                if key == "providers":
                    result["providers"].append(stripped_cont)
                if key == "consumers" or key == "requirers":
                    result["consumers"].append(stripped_cont)
    return result


def find_between(s, first, last):
    try:
        start = s.index(first) + len(first)
        end = s.index(last, start)
        return s[start:end]
    except ValueError:
        return ""


def get_interfaces_from_mrkd_table(content):
    """
    This function will return a list of interfaces from
    a Markdown table. The table needs to start with
    "| Interface"
    """
    table_content = content.split("\n## Interfaces")[-1].strip("\n")
    lines = table_content.split("\n")

    data = []
    keys = []

    # Get data from table
    for i, l in enumerate(lines):
        if i == 0:
            keys = [
                _i.strip().lower().replace(" ", "_") for _i in l.split("|")
            ]
        elif i == 1 or not l.startswith("|"):
            continue
        else:
            data.append(
                {
                    keys[_i]: v.strip()
                    for _i, v in enumerate(l.split("|"))
                    if _i > 0 and _i < len(keys) - 1
                }
            )

    interfaces = []

    # Curate data for the interface
    for interface in data:
        name_data = interface["interface"]

        if "[" in name_data:
            name = find_between(name_data, "[", "]").replace("`", "")
            readme_path = find_between(name_data, "(", ")")
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

        interfaces.append(
            {
                "name": name,
                "readme_path": readme_path,
                "version": version,
                "status": status,
            }
        )

    return interfaces


def filter_interfaces_by_status(interfaces, status):
    return list(filter(lambda item: (item["status"] == status), interfaces))


def get_short_description_from_readme(readme):
    lines = readme.split("\n")

    for line in lines:
        if line and line[0].isalpha():
            return line

    return None


def strip_str(string):
    return re.sub(r"[^a-zA-Z0-9 ().,!-_/:;`]", "", string)


def get_h_content(text, pattern):
    start_index = text.index(pattern)
    return [start_index, start_index + len(pattern)]


def extract_text(text, delimiter):
    headings = re.findall(f"{delimiter}" + r"\s\S+", text)
    start_end = {heading: get_h_content(text, heading) for heading in headings}
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


def convert_readme(text, level=2):
    headings_and_contents = extract_text(text, "\n" + ("#" * level))
    if len(headings_and_contents) == 0:
        if not text.startswith("- "):
            return "".join([s for s in text.split("\n") if s.strip("\n")])
        else:
            return [strip_str(t) for t in text.strip("- ").split("\n- ")]

    result = {}
    for heading, content in headings_and_contents:
        temp = {}
        strip_char = "{}{}".format("#" * level, " ")
        heading = heading.strip(strip_char)
        if content[0].isalpha and "#" in content:
            if content.split("\n\n", 1)[0] == "Data":
                heading = heading + "-" + content.split("\n\n", 1)[0]
                result[heading] = convert_readme(content, level + 1)
            else:
                temp[heading] = convert_readme(content, level + 1)
                result.update(temp)
                try:
                    result[heading]["Introduction"] = content.split("\n\n", 1)[
                        0
                    ]
                except TypeError:
                    result[heading] = convert_readme(content, level + 1)

        else:
            result[heading] = convert_readme(content, level + 1)

    return result


def get_interface_name_from_readme(text):
    return re.sub(r"[#` \n]", "", text.split("\n##", 1)[0])
