import { Strip, Row, Col } from "@canonical/react-components";

import type { InterfaceData } from "../../types";

type Props = {
  interfaceData: InterfaceData;
  isCommunity: boolean;
};

function ProvidingCharms({ interfaceData, isCommunity }: Props) {
  return (
    <Strip bordered shallow>
      <h3 className="p-heading--4">Providing {interfaceData?.name}</h3>
      {!!interfaceData?.charms?.providers?.length && (
        <>
          <h4 className="p-muted-heading">Featured charms</h4>
          <Row className="u-no-padding--left u-no-padding--right">
            {interfaceData?.charms?.providers.map((provider) => (
              <Col size={3} key={provider.name}>
                <div className="p-card--highlighted">
                  <iframe
                    className="u-no-margin--bottom"
                    height={170}
                    style={{ width: "100%" }}
                    src={`/${provider.name}/embedded/interface`}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
      {interfaceData?.other_charms?.providers &&
        interfaceData.other_charms.providers.length > 0 && (
          <>
            {!!interfaceData?.charms?.providers?.length && (
              <h4 className="p-muted-heading">Other charms</h4>
            )}
            <ul className="p-list u-split--3">
              {interfaceData?.other_charms?.providers.map((charm) => (
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

export default ProvidingCharms;
