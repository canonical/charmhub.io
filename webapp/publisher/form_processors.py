from flask import request


def extract_basic_form_fields():
    FIELDS = [
        "title",
        "summary",
        "description",
        "creator_email",
        "mattermost_handle",
        "icon",
        "terraform_modules",
        "documentation_main",
        "documentation_source",
        "get_started_url",
        "submit_bug_url",
        "community_discussion_url",
        "architecture_diagram_url",
        "architecture_explanation",
    ]

    return {field: request.form.get(field, "").strip() for field in FIELDS}


def extract_charms_data():
    return request.form.getlist("charms[]")


def extract_useful_links_data():
    useful_links_titles = request.form.getlist("useful_links_title[]")
    useful_links_urls = request.form.getlist("useful_links_url[]")
    useful_links = []

    for title, url in zip(useful_links_titles, useful_links_urls):
        if title.strip() and url.strip():
            useful_links.append({"title": title.strip(), "url": url.strip()})

    return useful_links


def extract_use_cases_data():
    use_cases_titles = request.form.getlist("use_cases_title[]")
    use_cases_descriptions = request.form.getlist("use_cases_description[]")
    use_cases = []

    for title, description in zip(use_cases_titles, use_cases_descriptions):
        if title.strip() and description.strip():
            use_cases.append(
                {"title": title.strip(), "description": description.strip()}
            )

    return use_cases


def extract_maintainers_data():
    maintainers_emails = request.form.getlist("maintainers_email[]")
    return [email.strip() for email in maintainers_emails if email.strip()]


def extract_platform_data():
    def clean_list(field_name):
        return [
            item.strip()
            for item in request.form.getlist(field_name)
            if item.strip()
        ]

    return {
        "platform": request.form.get("platform", "").strip(),
        "platform_version": clean_list("platform_version[]"),
        "platform_prerequisites": clean_list("platform_prerequisites[]"),
        "juju_versions": clean_list("juju_versions[]"),
    }


def process_solution_form_data():
    form_data = extract_basic_form_fields()

    if not form_data.get("get_started_url") and form_data.get(
        "documentation_main"
    ):
        form_data["get_started_url"] = form_data["documentation_main"]

    form_data["charms"] = extract_charms_data()
    form_data["useful_links"] = extract_useful_links_data()
    form_data["use_cases"] = extract_use_cases_data()
    form_data["maintainers"] = extract_maintainers_data()

    platform_data = extract_platform_data()
    form_data.update(platform_data)

    return form_data


def create_error_context(errors, solution, user_teams, form_data=None):
    return {
        "has_solutions": True,
        "user_teams": user_teams,
        "solution": solution,
        "form_data": form_data,
        "errors": errors,
    }
