from typing import TypedDict, List, Union, Dict
from collections import Counter
from datetime import datetime
from webapp.observability.utils import trace_function
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
        "errors": Union[List[Error], None],
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


@trace_function
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
        res[channel["name"]]["releases"] = {}

    revision_map = {}

    for revision in revisions:
        revision_map[revision["revision"]] = process_revision(revision)

    for channel in channel_map:
        revision = revision_map[channel["revision"]]
        resources = channel["resources"]
        res[channel["channel"]]["releases"][revision["revision"]] = {
            "revision": revision,
            "resources": resources,
        }

    for channel in list(res):
        releases = list(res[channel]["releases"].values())

        releases.sort(
            key=lambda x: datetime.strptime(
                x["revision"]["created-at"], "%Y-%m-%dT%H:%M:%SZ"
            ),
            reverse=True,
        )

        if len(releases) > 0:
            res[channel]["releases"] = releases
        else:
            del res[channel]

    return res


@trace_function
def get_all_architectures(releases: Dict[str, ReleaseMap]) -> List[str]:
    """
    Get all architectures from the releases

    Args:
    releases: Dictionary with channel name as key
    and a list of releases as value

    Returns:
    List of architectures, sorted by frequency

    """
    architectures = Counter()
    for channel in releases:
        for release in releases[channel]["releases"]:
            for base in release["revision"]["bases"]:
                architectures.update([base["architecture"]])

    return [arch for arch, _ in architectures.most_common()]
