import { Accordion, Button, Input, Panel } from "@canonical/react-components";
import { useState } from "react";

type AddTrackPanelProps = {
  charmName: string;
  onClose: () => void;
};

export default function AddTrackPanel({
  charmName,
  onClose,
}: AddTrackPanelProps) {
  const [trackName, setTrackName] = useState("");
  const [versionPattern, setVersionPattern] = useState("");
  const [phasingPercentage, setPhasingPercentage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>(
    {}
  );

  const submit = async () => {
    if (!trackName || !!Object.keys(errors).filter((key) => errors[key]).length)
      return;

    setLoading(true);

    const formData = new FormData();
    formData.append("csrf_token", window.CSRF_TOKEN);
    formData.append("track-name", trackName);
    if (versionPattern) formData.append("version-pattern", versionPattern);
    if (phasingPercentage)
      formData.append("auto-phasing-percentage", phasingPercentage);

    const response = await fetch(`/${charmName}/create-track`, {
      method: "POST",
      body: formData,
    });
    setLoading(false);
  };

  return (
    <Panel
      wrapContent={false}
      header={
        <div className="p-panel__header u-no-padding--left u-no-padding--right">
          <h4 className="p-panel__title">Add track</h4>
        </div>
      }
    >
      <div
        className="p-panel__content u-no-padding--top u-no-padding--bottom"
        style={{ overflow: "auto" }}
      >
        <Input
          help="Name should follow the track creation guardrails (TCG)"
          placeholder="display-name-123"
          label="* Track name"
          type="text"
          onChange={(e) => {
            setTrackName(e.target.value);
          }}
          value={trackName}
        />
        <Accordion
          sections={[
            {
              key: "optional properties",
              title: "Optional Properties",
              content: (
                <>
                  <Input
                    help="Version pattern should follow glob pattern"
                    placeholder="?.v.*"
                    label="Version pattern"
                    type="text"
                    onChange={(e) => setVersionPattern(e.target.value)}
                    value={versionPattern}
                  />
                  <Input
                    help={
                      <>
                        The percentage is a value from 0 to 100
                        <br />
                        Releases will be done progressively on the track and its
                        percentage will be incremented automatically.
                      </>
                    }
                    placeholder="14.9"
                    label="Automatic phasing percentage"
                    error={errors?.phasingPercentage}
                    type="text"
                    onChange={(e) => {
                      const phasingPercentageValue = Number(e.target.value);
                      if (isNaN(phasingPercentageValue)) {
                        setErrors({
                          phasingPercentage: "Percentage must be a number",
                        });
                      } else if (
                        phasingPercentageValue &&
                        (phasingPercentageValue > 100 ||
                          phasingPercentageValue < 0)
                      ) {
                        setErrors({
                          phasingPercentage:
                            "Percentage must be between 0 and 100",
                        });
                      } else {
                        setErrors({ ...errors, phasingPercentage: undefined });
                      }
                      setPhasingPercentage(e.target.value);
                    }}
                    value={phasingPercentage}
                  />
                </>
              ),
            },
          ]}
        />
        <p>* Mandatory fields</p>
      </div>
      <div>
        <p>
          <a target="_blank" href="https://juju.is/docs/juju/channel">
            Learn about tracks
          </a>{" "}
          or{" "}
          <a target="_blank" href="https://discourse.charmhub.io">
            contact us
          </a>{" "}
          for help.
        </p>
      </div>
      <div className="p-panel__footer u-align--right">
        <div className="u-fixed-width">
          <Button className="u-no-margin--bottom" onClick={onClose}>
            Cancel
          </Button>
          <Button
            appearance="positive"
            onClick={submit}
            disabled={
              loading ||
              !trackName ||
              !!Object.keys(errors).filter((key) => errors[key]).length
            }
          >
            Add Track
          </Button>
        </div>
      </div>
    </Panel>
  );
}
