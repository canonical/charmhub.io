import type { ICharm } from "../types";

import { Card } from "@canonical/react-components";

interface CharmCardProps {
  charm: ICharm;
}

const CharmCard = ({ charm }: CharmCardProps) => {
  return (
    <a href={`/${charm.name}`} className="p-charm-card">
      <Card highlighted>
        <div className="p-media-object u-no-margin--bottom">
          <img
            src={
              charm.store_front.icons[0] ??
              "https://res.cloudinary.com/canonical/image/fetch/f_auto,q_auto,fl_sanitize,w_24,h_24/https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg"
            }
            alt={`${charm.name} icon`}
            className="p-media-object__image is-round"
            style={{ marginTop: "0.45rem", width: 24, height: 24 }}
          />
          <div
            className="p-media-object__details"
            style={{ overflow: "hidden", flexGrow: 1 }}
          >
            <h4
              className="p-heading--5 p-media-object__title"
              style={{
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {charm.store_front["display-name"]}
            </h4>
            <div className="p-media-object__content">
              <p
                className="u-no-margin--bottom"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
                title={charm.result?.publisher?.["display-name"]}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {charm.result?.publisher?.["display-name"]}{" "}
                </span>
                {charm.store_front?.["deployable-on"]?.includes(
                  "kubernetes"
                ) && (
                  <img
                    src="https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg"
                    style={{
                      position: "relative",
                      marginLeft: "1rem",
                      flexShrink: 0,
                      justifySelf: "flex-end",
                    }}
                    alt="Deployable on Kubernetes"
                  />
                )}
                {charm.store_front?.["deployable-on"]?.includes("vm") && (
                  <img
                    src="https://assets.ubuntu.com/v1/a911ecf6-vm-badge.svg"
                    style={{
                      position: "relative",
                      marginLeft: "1rem",
                      flexShrink: 0,
                      justifySelf: "flex-end",
                    }}
                    alt="Deployable on VM"
                  />
                )}
              </p>
              <p>
                {charm["default-release"].channel.name}/
                {charm["default-release"].channel.track}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
};

export default CharmCard;
