import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMermaid from "remark-mermaidjs";
import { Row, Col } from "@canonical/react-components";

import type {
  SectionData,
  SubSectionData,
  SubSubSectionData,
} from "../../types";

import { v4 as uuidv4} from 'uuid';

function addUniqueIds(data: any) {
  return data.map((item: any) => {
    return {
      content: item,
      id: uuidv4(),
    };
  });
}

function SubSubSection({
  interfaceData,
}: {
  interfaceData: SubSubSectionData;
}) {
  const data = addUniqueIds(interfaceData.children);

  return (
    <>
      <p>{interfaceData.heading}</p>
      {data.map((item: { id: string; content: string }) => (
        <ReactMarkdown key={item.id} remarkPlugins={[remarkMermaid]}>
          {item.content}
        </ReactMarkdown>
      ))}
    </>
  );
}

function SubSection({ interfaceData }: { interfaceData: SubSectionData }) {
  const data = addUniqueIds(interfaceData.children);

  return (
    <Row>
      <Col size={3}>
        <h3 className="p-muted-heading">{interfaceData.heading}</h3>
      </Col>
      <Col size={6}>
        {data.map((item: { id: string; content: any }) =>
          typeof item.content === "string" ? (
            <ReactMarkdown key={item.id} remarkPlugins={[remarkMermaid]}>
              {item.content}
            </ReactMarkdown>
          ) : (
            <SubSubSection key={item.id} interfaceData={item.content} />
          )
        )}
      </Col>
    </Row>
  );
}

function DocumentationSection({
  interfaceData,
}: {
  interfaceData: SectionData;
}) {
  const data = addUniqueIds(interfaceData.children);

  return (
    <>
      <h2 className="p-heading--4">{interfaceData.heading}</h2>
      {data.map((item: { id: string; content: any }) =>
        typeof item.content === "string" ? (
          <ReactMarkdown key={item.id} remarkPlugins={[remarkMermaid]}>
            {item.content}
          </ReactMarkdown>
        ) : (
          <SubSection key={item.id} interfaceData={item.content} />
        )
      )}
    </>
  );
}

export default DocumentationSection;
