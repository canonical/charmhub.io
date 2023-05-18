import React from "react";
import { Strip, Row, Col } from "@canonical/react-components";

import type { InterfaceData } from "../../types";

type Props = {
  interfaceData: InterfaceData;
  isCommunity: boolean;
};

function RequiringCharms({ interfaceData, isCommunity }: Props) {
  return (
    <Strip shallow>
      <h3 className="p-heading--4">Requiring {interfaceData?.name}</h3>
      {!!interfaceData?.charms?.requirers?.length && (
        <>
          <h4 className="p-muted-heading">Featured charms</h4>
          <Row className="u-no-padding--left u-no-padding--right">
            {interfaceData?.charms?.requirers.map((requirer) => (
              <Col size={3} key={requirer.name}>
                <div className="p-card--highlighted">
                  <iframe
                    className="u-no-margin--bottom"
                    height={170}
                    style={{ width: "100%" }}
                    src={`/${requirer.name}/embedded/interface`}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}

      {interfaceData?.other_charms?.requirers &&
        interfaceData?.other_charms?.requirers.length > 0 && (
          <>
            {!!interfaceData?.charms?.requirers?.length && (
              <h4 className="p-muted-heading">Other charms</h4>
            )}
            <ul className="p-list u-split--3">
              {interfaceData?.other_charms?.requirers.map((charm) => (
                <li key={charm.id}>
                  <a href={`/${charm?.name}`}>{charm?.name}</a>
                </li>
              ))}
            </ul>
          </>
        )}
      {!isCommunity && (
        <p>
          <a href="https://discourse.charmhub.io/t/getting-started-with-charm-testing/6894">
            How to test a charm
          </a>
        </p>
      )}
    </Strip>
  );
}

export default RequiringCharms;
