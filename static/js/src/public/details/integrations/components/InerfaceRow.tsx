import React from "react";

import type { ICharm } from "../../../../shared/types";
import { Col, Row } from "@canonical/react-components";

interface InerfaceRowProps {
  charm: ICharm;
}

const getDisplayName = (charm: ICharm) => {
  if (charm.package.display_name) {
    return charm.package.display_name;
  }

  return charm.package.name.replace(/-/g, " ");
};

export const InerfaceRow = ({ charm }: InerfaceRowProps) => {
  const charmName = getDisplayName(charm);
  const packageLink = `/${charm.package.name}`;
  const channel = `${charm.package.channel.track}/${charm.package.channel.risk}`;
  const supportsVm = charm.package.platforms.includes("vm");
  const supportsKubernetes =
    charm.package.platforms.includes("kubernetes") ||
    charm.package.platforms.includes("k8s");

  return (
    <Row>
      <Col size={3} className="u-flex">
        <a href={packageLink}>
          <img
            src={
              charm.package.icon_url ||
              "https://assets.ubuntu.com/v1/be6eb412-snapcraft-missing-icon.svg"
            }
            alt=""
            width={48}
            height={48}
          />
        </a>
        <div className="p-integration-row__meta">
          <a className="p-integration-row__name" href={packageLink}>
            {charmName}
          </a>
          <p className="u-text--muted u-no-margin--bottom">
            {charm.publisher.display_name}
          </p>
        </div>
      </Col>

      <Col size={2}>
        <p className="u-text--muted u-no-margin--bottom">{channel}</p>
      </Col>

      <Col size={3}>
        <p className="p-integration-row__description u-no-margin--bottom">
          {charm.package.description}
        </p>
      </Col>

      <Col size={1}>
        <div className="u-align--right">
          {supportsVm && (
            <img
              src="https://assets.ubuntu.com/v1/bf61e269-machine-badge.svg"
              width={24}
              height={24}
              alt="Machine"
            />
          )}
          {supportsKubernetes && (
            <img
              src="https://assets.ubuntu.com/v1/f1852c07-Kubernetes.svg"
              width={24}
              height={24}
              alt="Kubernetes"
            />
          )}
        </div>
      </Col>
    </Row>
  );
};

export default InerfaceRow;
