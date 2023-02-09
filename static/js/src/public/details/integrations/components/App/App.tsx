import type { IFilterChip, IInterfaceData } from "../../types";
import { useQuery } from "react-query";
import { useMemo } from "react";
import {
  Row,
  Col,
  Spinner,
  SearchAndFilter,
} from "@canonical/react-components";
import { InterfaceItem } from "../InterfaceItem";
import { useRecoilState, useRecoilValue } from "recoil";
import { filterChipsSelector, filterState } from "../../state";

const getIntegrations = async (charm: string): Promise<IInterfaceData[]> => {
  const resp = await fetch(`/${charm}/integrations.json`);
  const json = await resp.json();
  if (!json.grouped_relations) {
    return [];
  }

  const data = json.grouped_relations;
  const provides =
    data?.provides.map((item: IInterfaceData) => ({
      ...item,
      type: "provides",
    })) ?? [];
  const requires =
    data?.requires.map((item: IInterfaceData) => ({
      ...item,
      type: "requires",
    })) ?? [];

  return [...provides, ...requires];
};

export const App = () => {
  const charm = window.location.pathname.split("/")[1];
  const [filterData, setFilterData] = useRecoilState(filterState);
  const availableFilters = useRecoilValue(filterChipsSelector);

  const { data } = useQuery(["integrations", charm], () =>
    getIntegrations(charm)
  );

  const integrationCount = useMemo(() => data?.length ?? 0, [data]);

  const filterValues = useMemo(
    () =>
      filterData
        .filter((item: IFilterChip) => item.lead === "Integrations")
        .map((item: IFilterChip) => item.value),
    [filterData]
  );

  const filteredData = useMemo(
    () =>
      filterValues.length === 0
        ? data
        : data?.filter((item) => {
            const key = `${item.key} | ${item.interface}`;
            return filterValues.includes(key);
          }),
    [data, filterValues]
  );

  return (
    <Col size={12}>
      {!data && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "10rem",
          }}
        >
          <Spinner text="Loading..." />
        </div>
      )}
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
                setFilterData((prev) =>
                  prev !== searchData ? (searchData as IFilterChip[]) : prev
                );
              }}
            />
          </Col>
          {filteredData?.map((interfaceItem: IInterfaceData) => (
            <InterfaceItem
              key={`${interfaceItem.key}|${interfaceItem.interface}`}
              interfaceType={interfaceItem!.type!}
              interfaceData={interfaceItem}
            />
          ))}
        </Row>
      )}
    </Col>
  );
};

export default App;
