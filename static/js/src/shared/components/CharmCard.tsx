import type { ICharm } from "../types";

import { Card } from "@canonical/react-components";

interface CharmCardProps {
  charm: ICharm;
}

const CharmCard = ({ charm }: CharmCardProps) => {
  return (
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
        <div className="p-media-object__details" style={{ overflow: "hidden" }}>
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
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <span style={{ minHeight: "3rem" }}>
                {charm.result?.publisher?.["display-name"]}{" "}
              </span>
              {charm.store_front?.["deployable-on"]?.includes("kubernetes") && (
                <img
                  src="https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg"
                  style={{
                    position: "relative",
                    top: "0.25rem",
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
                    top: "0.25rem",
                    marginLeft: "1rem",
                    flexShrink: 0,
                    justifySelf: "flex-end",
                  }}
                  alt="Deployable on VM"
                />
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CharmCard;
