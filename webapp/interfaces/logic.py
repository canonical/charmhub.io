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
