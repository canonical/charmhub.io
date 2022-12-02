import type { IInterfaceData } from "../../types";
import { useEffect, useState, useMemo } from "react";
import { Row, Col, Loader, SearchAndFilter } from "@canonical/react-components";
import { InterfaceSection } from "../InterfaceSection";

interface ResponseData {
  provides: IInterfaceData[];
  requires: IInterfaceData[];
}

export const App = () => {
  const charm = window.location.pathname.split("/")[1];
  const [data, setData] = useState<ResponseData>();

  useEffect(() => {
    fetch(`/${charm}/integrations.json`)
      .then((response) => response.json())
      .then((json) => setData(json.grouped_relations));
  }, []);

  const integrationCount = useMemo(
    () => (data ? data.provides.length + data.requires.length : 0),
    [data]
  );

  return (
    <Col size={12}>
      {!data && <Loader text="Loading..." />}
      {data && (
        <Row>
          <Col size={6}>
            <h2 className="p-heading--3">
              {integrationCount} integration{integrationCount > 1 ? "s" : ""}{" "}
              related to this charm
            </h2>
          </Col>
          <Col size={6}>
            <SearchAndFilter
              filterPanelData={[]}
              returnSearchData={(searchData) => {
                console.log(searchData);
              }}
            />
          </Col>
          {data.provides.length > 0 && (
            <InterfaceSection interfaceType="provides" data={data.provides} />
          )}
          {data.requires.length > 0 && (
            <InterfaceSection interfaceType="requires" data={data.requires} />
          )}
        </Row>
      )}
    </Col>
  );
};

export default App;
