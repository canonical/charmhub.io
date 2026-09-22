"""
llms.txt, llms-full.txt and the Markdown version of every page.
Only the site-specific configuration lives here.
"""

from canonicalwebteam.store_llm import StoreLLM

BASE_URL = "https://charmhub.io"

SUMMARY = (
    "Charmhub is the home of the Open Operator Collection: charms and "
    "bundles, the software operators that Juju uses to deploy, integrate "
    "and manage applications on Kubernetes, cloud and VM environments. "
    "Publishers use charmhub.io to register names, publish and manage "
    "their charms."
)

SECTIONS = {
    "": "Main pages",
}

SECTION_ORDER = [
    "Main pages",
    "Documentation",
]

# Links that cannot be discovered: resources hosted elsewhere and the
# charm pages, which take a URL parameter.
EXTRA_LINKS = [
    {
        "section": "Documentation",
        "url": "https://documentation.ubuntu.com/juju/",
        "title": "Juju documentation",
        "description": (
            "How to deploy, integrate and manage charms with Juju: "
            "models, relations, and the CLI."
        ),
    },
    {
        "section": "Documentation",
        "url": "https://documentation.ubuntu.com/charmcraft/",
        "title": "Charmcraft documentation",
        "description": (
            "The build tool: charmcraft.yaml reference and how-to guides "
            "for writing and publishing charms."
        ),
    },
    {
        "section": "Optional",
        "url": BASE_URL + "/llms-full.txt",
        "title": "Every page in one file",
        "description": (
            "The pages above concatenated as Markdown, for reading in "
            "one request rather than following each link."
        ),
    },
    {
        "section": "Optional",
        "url": BASE_URL + "/sitemap-operators.xml",
        "title": "Charm sitemap",
        "description": (
            "Every charm page on the store. Large - for exhaustive "
            "crawling rather than reading."
        ),
    },
]

store_llm = StoreLLM(
    base_url=BASE_URL,
    site_name="Charmhub",
    summary=SUMMARY,
    sections=SECTIONS,
    section_order=SECTION_ORDER,
    extra_links=EXTRA_LINKS,
)
