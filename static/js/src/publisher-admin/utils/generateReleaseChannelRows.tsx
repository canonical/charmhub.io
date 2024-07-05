import { List } from "@canonical/react-components";

// TODO: this should filter by selected architecture
export function generateReleaseChannelRows(
  releaseChannel: ReleaseChannel,
  openChannel: string | null,
  setOpenChannel: (channel: string | null) => void
) {
  const channelName = `${releaseChannel.track}/${releaseChannel.risk}`;

  const isOpen = openChannel === channelName;

  const releases = isOpen
    ? releaseChannel.releases
    : releaseChannel.releases.slice(0, 1);

  return releases.map((release, i) => {
    const columns = [];

    if (i === 0) {
      columns.push({
        style: {
          display: "table-cell",
          border: "inherit",
          borderRight: "1px solid var(--vf-color-border-low-contrast)",
        },
        className: "u-align--left p-button--base has-icon",
        content: (
          <>
            <i className={`p-icon--chevron-${isOpen ? "down" : "right"}`} />
            <span>{channelName}</span>
          </>
        ),
        rowSpan: releaseChannel.releases.length,
        onClick: () =>
          isOpen ? setOpenChannel(null) : setOpenChannel(channelName),
      });
    }

    columns.push(
      ...[
        { content: i == 0 ? <strong>{release.revision.version}</strong> : release.revision.version, className: "u-align--center" },
        { content: new Date(release.revision["created-at"]).toLocaleDateString() },
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
  return (
    <List
      items={resources.map((resource) => {
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
      })}
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

  // Group bases by base name
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

        return (
          <div className="series-base" key={platform}>
            <div className="series-base__title">{icon}</div>

            <div>
              {[...bases].map((base) => (
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
