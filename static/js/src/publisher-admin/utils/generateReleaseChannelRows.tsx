import { List } from "@canonical/react-components";

export function generateReleaseChannelRows(
  releaseChannel: ReleaseChannel,
  arch: string,
  openChannel: string | null,
  setOpenChannel: (channel: string | null) => void
) {
  const channelName = `${releaseChannel.track}/${releaseChannel.risk}`;

  const isOpen = openChannel === channelName;

  const releases = isOpen
    ? releaseChannel.releases
    : releaseChannel.releases.slice(0, 1);

  const filteredReleases = releases.filter((release) =>
    release.revision.bases.some((base) => base.architecture === arch)
  );

  return filteredReleases.map((release, i) => {
    const columns = [];

    if (i === 0) {
      columns.push({
        className: "u-align--left release-channel ",
        content: (
          <>
            <i className={`p-icon--chevron-${isOpen ? "down" : "right"}`} />
            <span>{channelName}</span>
          </>
        ),
        rowSpan: isOpen ? releaseChannel.releases.length : 1,
        onClick: () =>
          isOpen ? setOpenChannel(null) : setOpenChannel(channelName),
      });
    }

    columns.push(
      ...[
        {
          content:
            i == 0 ? (
              <strong>{release.revision.version}</strong>
            ) : (
              release.revision.version
            ),
        },
        {
          content:
            release.revision["created-at"]
          ,
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
}

function ResourcesCell({ resources }: { resources: Resource[] }) {
  const items = resources.map((resource) => {
    const type = resource.type === "oci" ? "OCI Image" : "File";

    return (
      <>
        {resource.name} | {type}
        {resource.revision && (
          <>
            {": "}
            <span className="u-text--muted">
              revision {resource.revision}
            </span>
          </>
        )}
      </>
    );
  })

  if (items.length === 0) return "-"

  return (
    <List
      items={items}
    />
  );
}

const PLATFORM_ICONS: { [key: string]: JSX.Element } = {
  ubuntu: (
    <img
      src="https://assets.ubuntu.com/v1/adac6928-ubuntu.svg"
      alt="Ubuntu"
      width="89"
      height="20"
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

function BasesCell({ bases }: { bases: Base[] }) {
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
