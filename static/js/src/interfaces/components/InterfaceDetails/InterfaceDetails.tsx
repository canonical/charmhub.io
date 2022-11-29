import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Strip, Row, Col, Notification } from "@canonical/react-components";

type InterfaceData = {
  Behavior?: {
    Introduction: string;
    Provider: Array<string>;
    Requirer: Array<string>;
  };
  Direction?: string;
  "Relation-Data"?: {
    Provider: {
      Example: string;
      Introduction: string;
    };
    Requirer: {
      Example: string;
      Introduction: string;
    };
  };
  Usage: string;
};

function InterfaceDetails() {
  const { interfaceName } = useParams();
  const InterfaceNameWithoutVersion = interfaceName?.replace("-v", " v");

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
        <h1>{InterfaceNameWithoutVersion}</h1>
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
                <h2 id="developer-documentation">Developer documentation</h2>
              </Strip>

              <Strip bordered shallow>
                <h3 className="p-heading--4">Usage</h3>
                <ReactMarkdown>{interfaceData?.Usage}</ReactMarkdown>
              </Strip>

              <Strip bordered shallow>
                <h3 className="p-heading--4">Relation data</h3>
                <Row>
                  <Col size={3}>
                    <h4 className="p-muted-heading">Provider</h4>
                  </Col>
                  <Col size={6}>
                    <ReactMarkdown>
                      {interfaceData?.["Relation-Data"]?.Provider
                        ?.Introduction || ""}
                    </ReactMarkdown>
                    <p>Example:</p>
                    <ReactMarkdown>
                      {interfaceData?.["Relation-Data"]?.Provider?.Example ||
                        ""}
                    </ReactMarkdown>
                  </Col>
                </Row>
                <Row>
                  <Col size={3}>
                    <h4 className="p-muted-heading">Requirer</h4>
                  </Col>
                  <Col size={6}>
                    <ReactMarkdown>
                      {interfaceData?.["Relation-Data"]?.Requirer
                        ?.Introduction || ""}
                    </ReactMarkdown>
                    <p>Example:</p>
                    <ReactMarkdown>
                      {interfaceData?.["Relation-Data"]?.Requirer?.Example ||
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
                    <ReactMarkdown>
                      {interfaceData?.Direction || ""}
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
                    <ul>
                      {interfaceData?.Behavior?.Provider?.map((provider) => (
                        <li key={provider}>
                          <ReactMarkdown>{provider}</ReactMarkdown>
                        </li>
                      ))}
                    </ul>
                    <h5>Requirer</h5>
                    <ul>
                      {interfaceData?.Behavior?.Requirer?.map(
                        (requirer, index) => (
                          <li key={index}>
                            <ReactMarkdown>{requirer}</ReactMarkdown>
                          </li>
                        )
                      )}
                    </ul>
                  </Col>
                </Row>
              </Strip>
            </Col>
          </Row>
        )}
      </Strip>
    </>
  );
}

export default InterfaceDetails;
