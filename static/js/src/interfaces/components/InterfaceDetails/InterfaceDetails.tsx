import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { formatDistance } from "date-fns";
import { Strip, Row, Col, Notification } from "@canonical/react-components";

import InterfaceDetailsNav from "../InterfaceDetailsNav";
import InterfaceDiscussion from "../InterfaceDiscussion";
import CanonicalRelationsMeta from "../CanonicalRelationsMeta";
import CommunityRelationsMeta from "../CommunityRelationsMeta";
import InterfaceDetailsLinks from "../InterfaceDetailsLinks";
import DeveloperDocumentation from "../DeveloperDocumentation";
import ProvidingCharms from "../ProvidingCharms";
import RequiringCharms from "../RequiringCharms";

import type { InterfaceData } from "../../types";

const getInterface = async (
  interfaceName: string | undefined,
  interfaceStatus?: string | undefined
): Promise<InterfaceData> => {
  if (interfaceName) {
    if (interfaceStatus) {
      const response = await fetch(`./${interfaceStatus}.json`);
      if (response.status === 200) {
        return response.json();
      }
    }
    const response = await fetch(`./${interfaceName}.json`);
    if (response.status === 200) {
      return response.json();
    }
  }

  throw new Error("Interface is not a tested interface.");
};

type Props = {
  interfaceItem: InterfaceData;
};

function InterfaceDetails({ interfaceItem }: Props) {
  const { interfaceName, interfaceStatus } = useParams();
  const shouldFetchData = () => {
    if (interfaceItem && interfaceItem.name === interfaceName) {
      return false;
    }

    return true;
  };

  let isCommunity = false;

  let {
    data: interfaceData,
    error: interfaceError,
    isLoading: interfaceIsLoading,
  } = useQuery(
    ["interface", interfaceName],
    () => getInterface(interfaceName, interfaceStatus),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: shouldFetchData(),
    }
  );

  if (interfaceItem && interfaceItem.name === interfaceName) {
    interfaceData = interfaceItem;
  }

  let error = interfaceError as Error;
  let isLoading = interfaceIsLoading;

  const hasDeveloperDocumentation =
    interfaceData && interfaceData.body ? true : false;

  if (!hasDeveloperDocumentation) {
    isCommunity = true;
  }

  useEffect(() => {
    document.title = `Charmhub | ${interfaceName} interface`;
  }, []);

  return (
    <>
      <Strip type="light" shallow>
        <h1>
          {interfaceData?.name && <>{interfaceData?.name}</>}
          {!interfaceData?.name && interfaceName}
        </h1>
        <p>
          <Link to="/interfaces">See all interfaces</Link>
        </p>
      </Strip>
      <Strip>
        {error && (
          <div className="u-fixed-width">
            <Notification severity="negative" title="Error">
              There was a problem fetching this interface. {error.message}
              {isCommunity && (
                <>
                  <br />
                  <a href="https://discourse.charmhub.io/t/implementing-relations/1051">
                    Discuss this interface on discourse.
                  </a>
                </>
              )}
            </Notification>
          </div>
        )}

        {isLoading && shouldFetchData() && (
          <div className="u-fixed-width u-align--center">
            Fetching interface...
          </div>
        )}

        {interfaceData && !isLoading && (
          <Row>
            <Col size={3} className="interface-sidebar">
              <div className="u-hide--small u-hide--medium">
                <InterfaceDetailsNav
                  hasDeveloperDocumentation={hasDeveloperDocumentation}
                />
              </div>
              <InterfaceDetailsLinks
                isCommunity={isCommunity}
                interfaceName={interfaceName}
                interfaceVersion={interfaceData.version}
              />
              {!isCommunity && (
                <CanonicalRelationsMeta
                  interfaceName={interfaceName}
                  interfaceVersion={interfaceData.version}
                />
              )}
              {isCommunity && <CommunityRelationsMeta />}
              <InterfaceDiscussion />
            </Col>
            <Col size={9} className="interface-content">
              <div className="u-hide--large">
                <InterfaceDetailsNav
                  hasDeveloperDocumentation={hasDeveloperDocumentation}
                />
              </div>

              {!!(
                !interfaceData?.charms?.providers?.length &&
                !interfaceData?.other_charms?.providers?.length &&
                !interfaceData?.charms?.requirers?.length &&
                !interfaceData?.other_charms?.requirers?.length
              ) && (
                <Notification severity="information">
                  <p>No charms found that Provide or Require {interfaceName}</p>
                </Notification>
              )}

              {!!(
                interfaceData?.charms?.providers?.length ||
                interfaceData?.other_charms?.providers?.length ||
                interfaceData?.charms?.requirers?.length ||
                interfaceData?.other_charms?.requirers?.length
              ) && (
                <Strip className="u-no-padding--top" bordered shallow>
                  <h2 id="charms">Charms</h2>
                </Strip>
              )}

              {!!(
                interfaceData?.charms?.providers?.length ||
                interfaceData?.other_charms?.providers?.length
              ) && (
                <ProvidingCharms
                  interfaceData={interfaceData}
                  isCommunity={isCommunity}
                />
              )}

              {!!(
                interfaceData?.charms?.requirers?.length ||
                interfaceData?.other_charms?.requirers?.length
              ) && (
                <RequiringCharms
                  interfaceData={interfaceData}
                  isCommunity={isCommunity}
                />
              )}

              {hasDeveloperDocumentation && (
                <DeveloperDocumentation interfaceData={interfaceData} />
              )}

              <Notification severity="information">
                <>
                  {interfaceData.last_modified &&
                    `Last updated ${formatDistance(
                      new Date(interfaceData.last_modified),
                      new Date(),
                      {
                        addSuffix: true,
                      }
                    )}.`}{" "}
                  <a href="https://github.com/canonical/charm-relation-interfaces">
                    Help us improve this page
                  </a>
                  .
                </>
              </Notification>
            </Col>
          </Row>
        )}
      </Strip>
    </>
  );
}

export default InterfaceDetails;