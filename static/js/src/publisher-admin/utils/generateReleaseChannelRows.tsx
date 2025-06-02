import { Button, List } from "@canonical/react-components";
import { formatDate } from "./formatDate";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

const SHOW_MORE_THRESHOLD = 5;

export function generateReleaseChannelRows(
  releaseChannel: ReleaseChannel,
  arch: string,
  openChannel: string | null,
  setOpenChannel: (channel: string | null) => void,
  showAll: boolean,
  setShowAll: (showMore: boolean) => void
) {
  const channelName = `${releaseChannel.track}/${releaseChannel.risk}`;

  const isOpen = openChannel === channelName;

  const toggleOpenChannel = () => {
    setOpenChannel(isOpen ? null : channelName);
    setShowAll(false);
  };

  const filteredReleases = releaseChannel.releases.filter((release) =>
    release.revision.bases.some((base) => base.architecture === arch)
  );

  let releases = isOpen ? filteredReleases : filteredReleases.slice(0, 1);

  if (!showAll && releases.length > SHOW_MORE_THRESHOLD) {
    releases = releases.slice(0, SHOW_MORE_THRESHOLD);
  }

  const rows: MainTableRow[] = releases.map((release, i) => {
    const columns = [];

    if (i === 0) {
      columns.push({
        className: "u-align--left release-channel",
        content: (
          <>
            {filteredReleases.length > 1 && (
              <i className={`p-icon--chevron-${isOpen ? "down" : "right"}`} />
            )}
            <span>{channelName}</span>
          </>
        ),
        rowSpan:
          filteredReleases.length > SHOW_MORE_THRESHOLD
            ? releases.length + 1
            : releases.length,
        onClick: () =>
          filteredReleases.length > 1 ? toggleOpenChannel() : undefined,
      });
    }

    columns.push(
      ...[
        {
          content:
            i == 0 ? (
              <strong>{release.revision.revision}</strong>
            ) : (
              release.revision.revision
            ),
        },
        {
          content: formatDate(release.revision["created-at"]),
        },
        {
          content: <ResourcesCell resources={release.resources} />,
        },
        {
          content: <BasesCell bases={release.revision.bases} />,
        },
      ]
    );

    return {
      columns,
    };
  });

  if (!showAll && isOpen && filteredReleases.length > SHOW_MORE_THRESHOLD) {
    rows.push({
      columns: [
        {
          content: (
            <>
              Showing {SHOW_MORE_THRESHOLD} of {filteredReleases.length}{" "}
              releases.{" "}
              <Button appearance="link" onClick={() => setShowAll(true)}>
                Show more
              </Button>
            </>
          ),
          colSpan: 4,
          className: "u-align--right",
        },
      ],
    });
  }

  return rows;
}

export function ResourcesCell({ resources }: { resources: Resource[] }) {
  const items = resources.map((resource) => {
    const type = resource.type === "oci-image" ? "OCI Image" : "File";

    return (
      <>
        {resource.name} | {type}
        {resource.revision !== null && (
          <>
            {": "}
            <span className="u-text--muted">revision {resource.revision}</span>
          </>
        )}
      </>
    );
  });

  if (items.length === 0) return "-";

  return <List items={items} />;
}

const PLATFORM_ICONS: { [key: string]: JSX.Element } = {
  ubuntu: (
    <img
      src="https://assets.ubuntu.com/v1/b4ba06f2-Ubuntu%20logo.svg"
      alt="Ubuntu"
      width="85"
      height="30"
      className="p-image--base"
    />
  ),
  centos: (
    <img
      src="https://assets.ubuntu.com/v1/fd5cc5d8-CentOS.svg"
      alt="CentOS"
      width="85"
      height="24"
      className="p-image--base"
    />
  ),
} as const;

export function BasesCell({ bases }: { bases: Base[] }) {
  const baseGroups: Record<string, Set<string>> = {};

  bases.forEach((base) => {
    if (!baseGroups[base.name]) {
      baseGroups[base.name] = new Set<string>();
    }
    baseGroups[base.name].add(base.channel);
  });

  return (
    <>
      {Object.entries(baseGroups).map(([platform, bases]) => {
        const icon = PLATFORM_ICONS?.[platform];

        const sortedBases = [...bases].sort((a, b) => b.localeCompare(a));

        return (
          <div className="series-base" key={platform}>
            <div className="series-base__title">{icon}</div>

            <div>
              {sortedBases.map((base) => (
                <span key={base} className="series-tag">
                  {base}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
