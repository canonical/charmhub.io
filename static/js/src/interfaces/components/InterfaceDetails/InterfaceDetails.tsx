import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import ReactMarkdown from "react-markdown";
import remarkMermaid from "remark-mermaidjs";
import {
  Strip,
  Row,
  Col,
  Notification,
  Icon,
  Button,
} from "@canonical/react-components";

type InterfaceData = {
  Behavior: {
    Introduction: string;
    Provider: Array<string>;
    Requirer: Array<string>;
  };
  Direction?: Array<string>;
  Relation?: {
    Provider: {
      Example: Array<string>;
      Introduction: string;
    };
    Requirer: {
      Example: Array<string>;
      Introduction: string;
    };
  };
  Usage: Array<string>;
  charms?: {
    consumers: Array<string>;
    providers: Array<string>;
  };
  other_charms?: {
    providers: Array<{
      id: string;
      name: string;
    }>;
    requirers: Array<{
      id: string;
      name: string;
    }>;
  };
  name: string;
  version: string;
};

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
  interfaceName: string | undefined
): Promise<InterfaceData> => {
  if (interfaceName) {
    const response = await fetch(`./${interfaceName}.json`);
    if (response.status === 200) {
      return response.json();
    }
  }

  throw new Error("Interface is not a tested interface.");
};

function InterfaceDetails() {
  const { interfaceName } = useParams();
  let isCommunity = false;

  const hasDeveloperDocumentation = () => {
    return (
      interfaceData?.Usage && interfaceData?.Relation && interfaceData?.Behavior
    );
  };

  let {
    data: interfaceData,
    error: interfaceError,
    isLoading: interfaceIsLoading,
  } = useQuery(
    ["interface", interfaceName],
    () => getInterface(interfaceName),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  let error = interfaceError as Error;
  let isLoading = interfaceIsLoading;

  const charms = useQuery(
    ["charms", interfaceName],
    () => getCharms(interfaceName!),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
              <div className="p-side-navigation u-hide--small u-hide--medium">
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
              <h2 className="p-muted-heading">Relevant links</h2>
              <p>
                <a
                  href={`https://github.com/canonical/charm-relation-interfaces/issues/new?title=${
                    isCommunity ? "(Untested)+" : ""
                  }${interfaceName}${
                    interfaceData?.version ? `+${interfaceData.version}` : ""
                  }`}
                >
                  <Icon name="submit-bug" />
                  &nbsp;&nbsp;Submit a bug
                </a>
              </p>
              <p>
                <a href={`https://github.com/canonical/charm-relation-interfaces/tree/main/interfaces/${interfaceName}${interfaceData?.version ? `/${interfaceData.version}` : ""}`}>Specification folder</a>
              </p>
              {!isCommunity && (
                <>
                  <h2 className="p-muted-heading">Help us improve this page</h2>
                  <p>
                    Most of this content can be collaboratively discussed and
                    changed in the respective README file.
                  </p>
                  <p>
                    <Button
                      element="a"
                      href={`https://github.com/canonical/charm-relation-interfaces/blob/main/interfaces/${interfaceName}/${interfaceData?.version}/README.md`}
                      appearance="positive"
                    >
                      Contribute
                    </Button>
                  </p>
                </>
              )}
              {isCommunity && (
                <>
                  <h2 className="p-muted-heading">
                    Help us test this interface
                  </h2>
                  <p>
                    This interface doesn't have a schema yet, help the community
                    and get involved.
                  </p>
                  <p>
                    <Button
                      element="a"
                      href={`https://github.com/canonical/charm-relation-interfaces`}
                      appearance="positive"
                    >
                      Contribute
                    </Button>
                  </p>
                </>
              )}
              <h2 className="p-muted-heading">Discuss this interface</h2>
              <p>
                Share your thoughts on this interface with the community on
                discourse
              </p>
              <p>
                <Button
                  element="a"
                  href="https://discourse.charmhub.io/t/implementing-relations/1051"
                >
                  Join the discussion
                </Button>
              </p>
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
                <Strip bordered shallow>
                  <h3 className="p-heading--4">
                    Providing {interfaceData?.name}
                  </h3>
                  {!!interfaceData?.charms?.providers?.length && (
                    <>
                      <h4 className="p-muted-heading">Featured charms</h4>
                      <Row className="u-no-padding--left u-no-padding--right">
                        {interfaceData?.charms?.providers.map((provider) => (
                          <Col size={3} key={provider}>
                            <div className="p-card--highlighted">
                              <iframe
                                className="u-no-margin--bottom"
                                height={170}
                                style={{ width: "100%" }}
                                src={`/${provider}/embedded/interface`}
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
                          {interfaceData?.other_charms?.providers.map(
                            (charm) => (
                              <li key={charm.id}>
                                <a href={`/${charm?.name}`}>{charm?.name}</a>
                              </li>
                            )
                          )}
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
              )}

              {!!(
                interfaceData?.charms?.consumers?.length ||
                interfaceData?.other_charms?.requirers?.length
              ) && (
                <Strip shallow>
                  <h3 className="p-heading--4">
                    Requiring {interfaceData?.name}
                  </h3>
                  {!!interfaceData?.charms?.consumers?.length && (
                    <>
                      <h4 className="p-muted-heading">Featured charms</h4>
                      <Row className="u-no-padding--left u-no-padding--right">
                        {interfaceData?.charms?.consumers.map((consumer) => (
                          <Col size={3} key={consumer}>
                            <div className="p-card--highlighted">
                              <iframe
                                className="u-no-margin--bottom"
                                height={170}
                                style={{ width: "100%" }}
                                src={`/${consumer}/embedded/interface`}
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
                        {!!interfaceData?.charms?.consumers?.length && (
                          <h4 className="p-muted-heading">Other charms</h4>
                        )}
                        <ul className="p-list u-split--3">
                          {interfaceData?.other_charms?.requirers.map(
                            (charm) => (
                              <li key={charm.id}>
                                <a href={`/${charm?.name}`}>{charm?.name}</a>
                              </li>
                            )
                          )}
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
              )}

              {hasDeveloperDocumentation() && (
                <>
                  <Strip bordered shallow>
                    <h2 id="developer-documentation">
                      Developer documentation
                    </h2>
                  </Strip>
                  <Strip bordered shallow>
                    <h3 className="p-heading--4">Usage</h3>
                    <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                      {interfaceData.Usage.join("\n")}
                    </ReactMarkdown>
                  </Strip>
                  <Strip bordered shallow>
                    <h3 className="p-heading--4">Relation data</h3>
                    <Row>
                      <Col size={3}>
                        <h4 className="p-muted-heading">Provider</h4>
                      </Col>
                      <Col size={6}>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Relation?.Provider?.Introduction ||
                            ""}
                        </ReactMarkdown>
                        <p>Example:</p>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Relation?.Provider?.Example?.join(
                            "\n"
                          ) || ""}
                        </ReactMarkdown>
                      </Col>
                    </Row>
                    <Row>
                      <Col size={3}>
                        <h4 className="p-muted-heading">Requirer</h4>
                      </Col>
                      <Col size={6}>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Relation?.Requirer?.Introduction ||
                            ""}
                        </ReactMarkdown>
                        <p>Example:</p>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Relation?.Requirer?.Example?.join(
                            "\n"
                          ) || ""}
                        </ReactMarkdown>
                      </Col>
                    </Row>
                  </Strip>
                  <Strip shallow className="u-no-padding--bottom">
                    <h3 className="p-heading--4">Behaviour</h3>
                    {interfaceData?.Direction && (
                      <Row>
                        <Col size={3}>
                          <h4 className="p-muted-heading">Direction</h4>
                        </Col>
                        <Col size={6}>
                          <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                            {interfaceData?.Direction?.join("\n") || ""}
                          </ReactMarkdown>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col size={3}>
                        <h4 className="p-muted-heading">Requirements</h4>
                      </Col>
                      <Col size={6}>
                        <p>{interfaceData?.Behavior?.Introduction}</p>
                        <h5>Provider</h5>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Behavior?.Provider?.join("\n")}
                        </ReactMarkdown>
                        <h5>Requirer</h5>
                        <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                          {interfaceData?.Behavior?.Requirer?.join("\n")}
                        </ReactMarkdown>
                      </Col>
                    </Row>
                  </Strip>
                </>
              )}
              <Notification severity="information">
                <a href="https://github.com/canonical/charm-relation-interfaces">
                  Help us improve this page
                </a>
                .
              </Notification>
            </Col>
          </Row>
        )}
      </Strip>
    </>
  );
}

export default InterfaceDetails;
