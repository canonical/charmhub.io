import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
  other_charms: {
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

function InterfaceDetails() {
  const { interfaceName } = useParams();
  const [interfaceData, setInterfaceData] = useState<InterfaceData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(`./${interfaceName}.json`)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }

        throw response;
      })
      .then((data) => {
        setInterfaceData(data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Strip type="light" shallow>
        <h1>
          {interfaceData?.name} {interfaceData?.version}
        </h1>
        <p>
          <Link to="/interfaces">See all interfaces</Link>
        </p>
      </Strip>
      <Strip>
        {error && (
          <div className="u-fixed-width">
            <Notification severity="negative" title="Error">
              There was a problem fetching this interface. Please try again in a
              few moments.
            </Notification>
          </div>
        )}

        {loading && (
          <div className="u-fixed-width u-align--center">
            Fetching interface...
          </div>
        )}

        {interfaceData && !loading && (
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
                  <li className="p-side-navigation__item">
                    <a
                      href="#developer-documentation"
                      className="p-side-navigation__link"
                    >
                      Developer documentation
                    </a>
                  </li>
                </ul>
              </div>
              <h2 className="p-muted-heading">Relevant links</h2>
              <p>
                <a
                  href={`https://github.com/canonical/charm-relation-interfaces/issues/new?title=${interfaceData?.name}+${interfaceData?.version}`}
                >
                  <Icon name="submit-bug" />
                  &nbsp;&nbsp;Submit a bug
                </a>
              </p>
              <h2 className="p-muted-heading">Help us improve this page</h2>
              <p>
                Most of this content can be collaboratively discussed and
                changed in the respective README file.
              </p>
              <p>
                <Button
                  element="a"
                  href={`https://github.com/canonical/charm-relation-interfaces/blob/main/interfaces/${interfaceData?.name}/${interfaceData?.version}/README.md`}
                  appearance="positive"
                >
                  Contribute
                </Button>
              </p>
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
                  <li className="p-side-navigation__item">
                    <a
                      href="#developer-documentation"
                      className="p-side-navigation__link"
                    >
                      Developer documentation
                    </a>
                  </li>
                </ul>
              </div>

              <Strip className="u-no-padding--top" bordered shallow>
                <h2 id="charms">Charms</h2>
              </Strip>

              <Strip bordered shallow>
                <h3 className="p-heading--4">Providing</h3>
                <h4 className="p-muted-heading">Tested charms</h4>
                <Row className="u-no-padding--left u-no-padding--right">
                  {interfaceData?.charms?.providers.map((provider) => (
                    <Col size={3} key={provider}>
                      <iframe
                        height={260}
                        style={{ width: "100%" }}
                        src={`/${provider}/embedded?store_design=true`}
                      />
                    </Col>
                  ))}
                </Row>
                {interfaceData?.other_charms?.providers.length > 0 && (
                  <>
                    <h4 className="p-muted-heading">Other charms</h4>
                    <ul className="p-list u-split--3">
                      {interfaceData?.other_charms?.providers.map((charm) => (
                        <li key={charm.id}>
                          <a href={`/${charm?.name}`}>{charm?.name}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p>
                  <a href="https://discourse.charmhub.io/t/getting-started-with-charm-testing/6894">
                    How to test a charm
                  </a>
                </p>
              </Strip>

              <Strip shallow>
                <h3 className="p-heading--4">Requiring</h3>
                <h4 className="p-muted-heading">Tested charms</h4>
                <Row className="u-no-padding--left u-no-padding--right">
                  {interfaceData?.charms?.consumers.map((consumer) => (
                    <Col size={3} key={consumer}>
                      <iframe
                        height={260}
                        style={{ width: "100%" }}
                        src={`/${consumer}/embedded?store_design=true`}
                      />
                    </Col>
                  ))}
                </Row>
                {interfaceData?.other_charms?.requirers.length > 0 && (
                  <>
                    <h4 className="p-muted-heading">Other charms</h4>
                    <ul className="p-list u-split--3">
                      {interfaceData?.other_charms?.requirers.map((charm) => (
                        <li key={charm.id}>
                          <a href={`/${charm?.name}`}>{charm?.name}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p>
                  <a href="https://discourse.charmhub.io/t/getting-started-with-charm-testing/6894">
                    How to test a charm
                  </a>
                </p>
              </Strip>

              <Strip bordered shallow>
                <h2 id="developer-documentation">Developer documentation</h2>
              </Strip>

              <Strip bordered shallow>
                <h3 className="p-heading--4">Usage</h3>
                <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                  {interfaceData?.Usage.join("\n")}
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
                      {interfaceData?.Relation?.Provider?.Introduction || ""}
                    </ReactMarkdown>
                    <p>Example:</p>
                    <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                      {interfaceData?.Relation?.Provider?.Example.join("\n") ||
                        ""}
                    </ReactMarkdown>
                  </Col>
                </Row>
                <Row>
                  <Col size={3}>
                    <h4 className="p-muted-heading">Requirer</h4>
                  </Col>
                  <Col size={6}>
                    <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                      {interfaceData?.Relation?.Requirer?.Introduction || ""}
                    </ReactMarkdown>
                    <p>Example:</p>
                    <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                      {interfaceData?.Relation?.Requirer?.Example.join("\n") ||
                        ""}
                    </ReactMarkdown>
                  </Col>
                </Row>
              </Strip>

              <Strip shallow className="u-no-padding--bottom">
                <h3 className="p-heading--4">Behaviour</h3>
                <Row>
                  <Col size={3}>
                    <h4 className="p-muted-heading">Direction</h4>
                  </Col>
                  <Col size={6}>
                    <ReactMarkdown remarkPlugins={[remarkMermaid]}>
                      {(interfaceData?.Direction &&
                        interfaceData?.Direction.join("\n")) ||
                        ""}
                    </ReactMarkdown>
                  </Col>
                </Row>
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
                <Notification severity="information">
                  <a href="https://github.com/canonical/charm-relation-interfaces">
                    Help us improve this page
                  </a>
                  .
                </Notification>
              </Strip>
            </Col>
          </Row>
        )}
      </Strip>
    </>
  );
}

export default InterfaceDetails;
