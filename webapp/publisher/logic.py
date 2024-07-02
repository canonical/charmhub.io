from typing import TypedDict, List, Union, Dict
from webapp.store.logic import process_revision

Error = TypedDict("Error", {"code": str, "message": str})

Base = TypedDict("Base", {"architecture": str, "channel": str, "name": str})

Revision = TypedDict(
    "Revision",
    {
        "bases": List[Base],
        "created-at": str,
        "revision": int,
        "sha3-384": str,
        "size": int,
        "status": str,
        "version": str,
        "errors": Union[Error, None],
    },
)

Resource = TypedDict(
    "Resource", {"name": str, "revision": Union[int, None], "type": str}
)

Release = TypedDict(
    "Release", {"revision": Revision, "resources": List[Resource]}
)

ReleaseMap = TypedDict(
    "ReleaseMap",
    {
        "track": str,
        "risk": str,
        "releases": List[Release],
    },
)


def process_releases(
    channel_map, channels, revisions: List[Revision]
) -> Dict[str, ReleaseMap]:
    """
    Process the releases and return a dictionary with the
    channel name as key and a list of releases as value.

    Args:
    channel_map: Mapping of revisions to channels and resources
    channels: List of channels
    revisions: List of revisions

    Returns:
    Dictionary with channel name as key and a list of releases as value
    """

    res = {}
    for channel in channels:
        res[channel["name"]] = {}
        res[channel["name"]]["track"] = channel["track"]
        res[channel["name"]]["risk"] = channel["risk"]
        res[channel["name"]]["releases"] = []

    revision_map = {}

    for revision in revisions:
        revision_map[revision["revision"]] = process_revision(revision)

    for channel in channel_map:
        revision = revision_map[channel["revision"]]
        resources = channel["resources"]
        res[channel["channel"]]["releases"].append(
            {"revision": revision, "resources": resources}
        )

    return res
