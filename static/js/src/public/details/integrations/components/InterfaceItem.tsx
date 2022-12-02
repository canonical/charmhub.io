import type { IInterfaceData } from "../types";
import type { ICharm } from "../../../../shared/types";

import { useEffect, useState } from "react";

import { Row, Col, Loader } from "@canonical/react-components";

import CharmCard from "../../../../shared/components/CharmCard";

interface InterfaceItemProps {
  interfaceType: string;
  interfaceData: IInterfaceData;
}

export const InterfaceItem = ({
  interfaceType,
  interfaceData,
}: InterfaceItemProps) => {
  const [charms, setCharms] = useState<ICharm[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `/packages.json?${interfaceType}=${interfaceData.interface}`
      );
      const responseData = await response.json();
      console.log(responseData);
      setCharms(responseData?.packages);
      setFetching(false);
    })();
  }, [interfaceData]);

  return (
    <>
      <hr />
      <h3 className="p-heading--4 u-no-margin--bottom">
        {interfaceData.key} | {interfaceData.interface}
      </h3>
      {interfaceData.description && <p>{interfaceData.description}</p>}

      {charms?.length > 0 && (
        <>
          <p>
            Charms that{" "}
            <b>{interfaceType === "requires" ? "consume" : "provide"}</b>{" "}
            {interfaceData.interface}
          </p>
          <Row>
            {charms.map((charm: ICharm) => (
              <Col size={3} key={charm.name}>
                <CharmCard charm={charm} />
              </Col>
            ))}
          </Row>
        </>
      )}
      {charms.length === 0 && fetching && (
        <div className="u-fixed-width">
          <Loader text={`Loading charms for ${interfaceData.interface}`} />
        </div>
      )}
      {charms.length === 0 && !fetching && (
        <div className="u-fixed-width">
          <p>
            No charms found that <b>provide</b> or <b>consume</b>{" "}
            {interfaceData.interface}
          </p>
        </div>
      )}
    </>
  );
};
