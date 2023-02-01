import type { IInterfaceData, IFilterChip } from "../../types";
import { useQuery } from "react-query";
import { useMemo } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  Row,
  Col,
  Spinner,
  SearchAndFilter,
} from "@canonical/react-components";
import { InterfaceSection } from "../InterfaceSection";

import { filterState, filterChipsSelector } from "../../state";

interface ResponseData {
  provides: IInterfaceData[];
  requires: IInterfaceData[];
}

const getIntegrations = async (charm: string): Promise<ResponseData> => {
  const resp = await fetch(`/${charm}/integrations.json`);
  const json = await resp.json();
  return json.grouped_relations;
};

export const App = () => {
  const charm = window.location.pathname.split("/")[1];
  const setFilterData = useSetRecoilState(filterState);
  const availableFilters = useRecoilValue(filterChipsSelector);

  const { data } = useQuery(["integrations", charm], () =>
    getIntegrations(charm)
  );

  const integrationCount = useMemo(
    () => (data ? data.provides.length + data.requires.length : 0),
    [data]
  );

  return (
    <Col size={12}>
      {!data && <Spinner text="Loading..." />}
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
              filterPanelData={availableFilters as any}
              returnSearchData={(searchData: any) => {
                setFilterData(searchData as IFilterChip[]);
              }}
            />
          </Col>
          {data.provides?.length > 0 && (
            <InterfaceSection interfaceType="provides" data={data.provides} />
          )}
          {data.requires?.length > 0 && (
            <InterfaceSection interfaceType="requires" data={data.requires} />
          )}
        </Row>
      )}
    </Col>
  );
};

export default App;
