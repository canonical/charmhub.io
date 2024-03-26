import React from "react";
import { Strip } from "@canonical/react-components";

import DocumentationSection from "../DocumentationSection";

import type { InterfaceData } from "../../types";

import { v4 as uuidv4} from 'uuid';

type Props = {
  interfaceData: InterfaceData;
};

function DeveloperDocumentation({ interfaceData }: Props) {
  const data = interfaceData.body.map((item) => {
    return {
      ...item,
      id: uuidv4(),
    };
  });

  return (
    <>
      <Strip shallow bordered>
        <h2 id="developer-documentation">Developer documentation</h2>
      </Strip>
      {data.map((item, index) => (
        <Strip
          shallow
          bordered={index !== interfaceData.body.length - 1 ? true : false}
          key={item.id}
        >
          <DocumentationSection interfaceData={item} />
        </Strip>
      ))}
    </>
  );
}

export default DeveloperDocumentation;
