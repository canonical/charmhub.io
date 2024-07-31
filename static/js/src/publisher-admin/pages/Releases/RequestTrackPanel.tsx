import { Button, Panel } from "@canonical/react-components";

type RequestTrackPanelProps = {
  charmName: string;
  onClose: () => void;
};

export default function RequestTrackPanel({
  charmName,
  onClose,
}: RequestTrackPanelProps) {
  return (
    <Panel
      wrapContent={false}
      header={
        <div className="p-panel__header u-no-padding--left u-no-padding--right">
          <h4 className="p-panel__title">Request track</h4>
        </div>
      }
    >
      <div
        className="p-panel__content u-no-padding--top u-no-padding--bottom"
        style={{ overflow: "auto" }}
      >
        <h5 style={{ fontWeight: "bold" }}>What is a track?</h5>
        <p>
          A track contains a series of compatible releases. Any charm has the
          built-in stable track.
        </p>
        <p>
          Every track has risk-levels available (stable, beta, candidate, edge).
        </p>
        <p>
          If you need more tracks, you can request an admin to give you access
          to our self-service track creation panel.
        </p>

        <p>
          <a href="https://juju.is/docs/sdk/create-a-track-for-your-charm">
            How to create a track for your charm
          </a>
        </p>
        <p>
          <a href="https://juju.is/docs/sdk/charmcraft-release">
            How to make a release
          </a>
        </p>
        <h5 style={{ fontWeight: "bold" }}>What to expect?</h5>
        <p>
          After the forum request, we will be in touch with you to validate the
          track creation guardrail (TCG).
        </p>
        <p>
          After the admin validation, you will access a self-serve track
          creation service.
        </p>
      </div>
      <div className="p-panel__footer u-align--right">
        <div className="u-fixed-width">
          <Button className="u-no-margin--bottom" onClick={onClose}>
            Cancel
          </Button>
          <Button
            appearance="positive"
            onClick={() => {
              window.open(
                `https://discourse.charmhub.io/new-topic?title=Create+new+track+for+"${charmName}"&category=charmhub+requests`,
                "_blank"
              );
            }}
          >
            Request on Forum
          </Button>
        </div>
      </div>
    </Panel>
  );
}
