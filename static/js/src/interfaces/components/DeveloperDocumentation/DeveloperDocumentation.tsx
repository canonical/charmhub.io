import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMermaid from "remark-mermaidjs";
import { Strip, Row, Col } from "@canonical/react-components";

import type { InterfaceData } from "../../types";

type Props = {
  interfaceData: InterfaceData;
};

function DeveloperDocumentation({ interfaceData }: Props) {
  return (
    <>
      <Strip bordered shallow>
        <h2 id="developer-documentation">Developer documentation</h2>
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
              {interfaceData?.Relation?.Provider?.Introduction || ""}
            </ReactMarkdown>
            <p>Example:</p>
            <ReactMarkdown remarkPlugins={[remarkMermaid]}>
              {interfaceData?.Relation?.Provider?.Example?.join("\n") || ""}
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
              {interfaceData?.Relation?.Requirer?.Example?.join("\n") || ""}
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
  );
}

export default DeveloperDocumentation;
