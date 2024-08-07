import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Row, Col } from "@canonical/react-components";
import mermaid from "mermaid";
import MermaidDiagram from "../MermaidDiagram";

import type {
  SectionData,
  SubSectionData,
  SubSubSectionData,
} from "../../types";

interface UniqueIdItem<T> {
  content: T;
  id: string;
}

function addUniqueIds<T>(data: T[]): UniqueIdItem<T>[] {
  return data.map((item) => ({
    content: item,
    id: crypto.randomUUID(),
  }));
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
      {data.map((item) => (
        <ReactMarkdown key={item.id}>{item.content}</ReactMarkdown>
      ))}
    </>
  );
}

function SubSection({ interfaceData }: { interfaceData: SubSectionData }) {
  const data = Array.isArray(interfaceData.children)
    ? addUniqueIds(interfaceData.children)
    : [];

  return (
    <Row>
      <Col size={3}>
        <h3 className="p-muted-heading">{interfaceData.heading}</h3>
      </Col>
      <Col size={6}>
        {typeof interfaceData.children === "string" ? (
          <ReactMarkdown>{interfaceData.children}</ReactMarkdown>
        ) : (
          data.map((item) =>
            typeof item.content === "string" ? (
              <ReactMarkdown key={item.id}>{item.content}</ReactMarkdown>
            ) : (
              <SubSubSection key={item.id} interfaceData={item.content} />
            )
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

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
  }, []);

  return (
    <>
      <h2 className="p-heading--4">{interfaceData.heading}</h2>
      {data.map((item) =>
        typeof item.content === "string" ? (
          item.content.startsWith("```mermaid") ? (
            <MermaidDiagram key={item.id} code={item.content} />
          ) : (
            <ReactMarkdown key={item.id}>{item.content}</ReactMarkdown>
          )
        ) : (
          <SubSection key={item.id} interfaceData={item.content} />
        )
      )}
    </>
  );
}

export default DocumentationSection;
