import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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

const getCharms = async (interfaceName: string): Promise<InterfaceData> => {
  const requiresResp = await fetch(`/packages.json?requires=${interfaceName}`);
  const providesResp = await fetch(`/packages.json?provides=${interfaceName}`);
  const requiresJson = await requiresResp.json();
  const providesJson = await providesResp.json();
  const data: InterfaceData = {
    name: interfaceName,
    version: "",
    Usage: [""],
    Behavior: {
      Introduction: "",
      Provider: [""],
      Requirer: [""],
    },
    last_modified: null,
  };

  if (!!(requiresJson?.packages?.length || providesJson?.packages?.length)) {
    data.other_charms = {
      requirers: requiresJson.packages.map((charm: any) => ({
        id: charm.id,
        name: charm.name,
      })),
      providers: providesJson.packages.map((charm: any) => ({
        id: charm.id,
        name: charm.name,
      })),
    };

    return data;
  }

  throw new Error("Interface does not exist.");
};

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

function InterfaceDetails() {
  const { interfaceName, interfaceStatus } = useParams();
  let isCommunity = false;

  const hasDeveloperDocumentation = () => {
    return (
      interfaceData?.Usage || interfaceData?.Relation || interfaceData?.Behavior
    );
  };

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
    }
  );

  let error = interfaceError as Error;
  let isLoading = interfaceIsLoading;

  // Get charms from the package.json endpoint, filtering
  // by the interface name
  const charms = useQuery(
    ["charms", interfaceName],
    () => getCharms(interfaceName!),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Only fetch charms if the interface.json endpoint fails
      enabled: !!(
        interfaceName &&
        !interfaceIsLoading &&
        interfaceError &&
        !isLoading
      ),
    }
  );

  if (charms.data || charms.error || charms.isLoading) {
    interfaceData = charms.data;
    error = charms.error as Error;
    isLoading = charms.isLoading;
    isCommunity = true;
  }
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

        {isLoading && (
          <div className="u-fixed-width u-align--center">
            Fetching interface...
          </div>
        )}

        {interfaceData && !isLoading && (
          <Row>
            <Col size={3} className="interface-sidebar">
              <InterfaceDetailsNav
                hasDeveloperDocumentation={hasDeveloperDocumentation}
              />
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
              <div className="p-side-navigation u-hide--large">
                <ul className="p-side-navigation__list">
                  <li className="p-side-navigation__item">
                    <a
                      href="#charms"
                      className="p-side-navigation__link is-active"
                    >
                      Charms
                    </a>
                  </li>
                  {hasDeveloperDocumentation() && (
                    <li className="p-side-navigation__item">
                      <a
                        href="#developer-documentation"
                        className="p-side-navigation__link"
                      >
                        Developer documentation
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <Strip className="u-no-padding--top" bordered shallow>
                <h2 id="charms">Charms</h2>
              </Strip>

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
                interfaceData?.charms?.consumers?.length ||
                interfaceData?.other_charms?.requirers?.length
              ) && (
                <RequiringCharms
                  interfaceData={interfaceData}
                  isCommunity={isCommunity}
                />
              )}

              {hasDeveloperDocumentation() && (
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
