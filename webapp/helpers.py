import re
import json

from bs4 import BeautifulSoup
from flask import request
from ruamel.yaml import YAML
from slugify import slugify
from datetime import datetime, timedelta
import mistune
import bleach
from canonicalwebteam.discourse import DiscourseAPI
from dateutil import parser
import requests

session = requests.Session()
discourse_api = DiscourseAPI(
    base_url="https://discourse.charmhub.io/",
    session=session,
)

_yaml = YAML(typ="rt")
_yaml_safe = YAML(typ="safe")


def get_yaml_loader(typ="safe"):
    if typ == "safe":
        return _yaml_safe
    return _yaml


def is_safe_url(url):
    """
    Return True if the URL is inside the same app
    """
    return url.startswith(request.url_root) or url.startswith("/")


def get_soup(html_content):
    soup = BeautifulSoup(html_content, "html.parser")
    return soup


# Change all the headers (if step=2: eg h1 => h3)
def decrease_header(header, step):
    level = int(header.name[1:]) + step
    if level > 6:
        level = 6
    header.name = f"h{str(level)}"

    return header


def add_header_id(h, levels):
    id = slugify(h.get_text())
    level = int(h.name[1:])

    # Go through previous headings and find any that are lower
    levels.append((level, id))
    reversed_levels = list(reversed(levels))
    parents = []
    level_cache = None
    for i in reversed_levels:
        if i[0] < level and not level_cache:
            parents.append(i)
            level_cache = i[0]
        elif i[0] < level and i[0] < level_cache:
            parents.append(i)
            level_cache = i[0]
    parents.reverse()
    if "id" not in h.attrs:
        parent_path_id = ""
        if len(parents) > 0:
            parent_path_id = "--".join([i[1] for i in parents]) + "--"
        h["id"] = parent_path_id + id

    return h


def modify_headers(soup, decrease_step=2):
    levels = []

    for header in soup.find_all(re.compile("^h[1-6]$")):
        decrease_header(header, decrease_step)
        add_header_id(header, levels)

    return soup


def schedule_banner(start_date: str, end_date: str):
    try:
        end = datetime.strptime(end_date, "%Y-%m-%d")
        start = datetime.strptime(start_date, "%Y-%m-%d")
        present = datetime.now()
        return start <= present < end
    except ValueError:
        return False


def markdown_to_html(markdown_text):
    markdown = mistune.create_markdown(renderer=mistune.HTMLRenderer())
    return markdown(markdown_text)


ALLOWED_HTML_TAGS = set(bleach.sanitizer.ALLOWED_TAGS).union(
    {
        "br",
        "code",
        "div",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "hr",
        "img",
        "p",
        "pre",
        "span",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr",
    }
)
ALLOWED_HTML_ATTRIBUTES = {
    **bleach.sanitizer.ALLOWED_ATTRIBUTES,
    "*": ["class", "id"],
    "a": ["href", "rel", "target", "title"],
    "img": ["alt", "height", "src", "title", "width"],
    "td": ["colspan", "rowspan"],
    "th": ["colspan", "rowspan"],
}
ALLOWED_HTML_PROTOCOLS = ["http", "https", "mailto", "tel"]


def sanitize_html(html_content):
    if not html_content:
        return ""
    return bleach.clean(
        html_content,
        tags=ALLOWED_HTML_TAGS,
        attributes=ALLOWED_HTML_ATTRIBUTES,
        protocols=ALLOWED_HTML_PROTOCOLS,
        strip=True,
    )


def param_redirect_capture(req, resp):
    """
    Functions that captures params and sets a cookie based on a match
    with a predefined list.
    """
    # Signatures to capture in a cookie
    param_signatures = [{"endpoint": "/accept-invite", "params": ["package", "token"]}]
    path = req.path
    params = req.args

    for item in param_signatures:
        # If the endpoint and params match a param_signature
        if item["endpoint"] == path and set(params).issubset(item["params"]):
            param_values = {}
            for param in item["params"]:
                param_values[param] = params[param]
            # Set the cookie
            resp.set_cookie(
                "param_redirect",
                json.dumps({"endpoint": item["endpoint"], "params": param_values}),
                # Set expiration for 10 days in the future
                expires=datetime.now() + timedelta(days=10),
                secure=True,
                httponly=True,
            )

    return resp


def param_redirect_exec(req, make_response, redirect):
    """
    Function that returns a response, redirecting based on
    a matched cookie
    """
    # Get cookie data
    encoded_redirect_data = req.cookies.get("param_redirect")

    if encoded_redirect_data:
        redirect_data = json.loads(encoded_redirect_data)
        # Only redirect if the current path matches the redirect endpoint
        if req.path == redirect_data["endpoint"]:
            params = []
            for key, value in redirect_data["params"].items():
                params.append(f"{key}={value}")
            response = make_response(
                redirect(f"{redirect_data['endpoint']}?{'&'.join(params)}")
            )
            response.set_cookie(
                "param_redirect", "", expires=0, secure=True, httponly=True
            )
            return response
    return None


def get_csp_as_str(csp={}):
    csp_str = ""
    for key, values in csp.items():
        csp_value = " ".join(values)
        csp_str += f"{key} {csp_value}; "
    return csp_str.strip()


def humanize_date(date_str):
    if not date_str:
        return ""
    date_obj = parser.parse(date_str)
    return date_obj.strftime("%-d %B %Y")


def format_solution_status(status):
    if not status:
        return status
    return status.replace("_", " ").title()


def get_solution_form_value(
    form_data, solution, form_field_name, solution_path=None, default=""
):
    """
    When updating a solution, get form field value
    When first loading edit form, shows current solution values
    When re-displaying form after validation errors,
    shows user's submitted values

    E.g.:
        get_solution_form_value(form_data, solution, 'title')
        # checks: form_data.title -> solution.title -> ""
    """
    if form_data and form_field_name in form_data:
        return form_data.get(form_field_name, default)

    if solution:
        path = solution_path if solution_path else form_field_name

        current_value = solution
        for key in path.split("."):
            if isinstance(current_value, dict) and key in current_value:
                current_value = current_value[key]
            else:
                return default

        return current_value if current_value is not None else default

    return default
