import type { IFilterChip, IInterfaceData } from "../../types";
import { useQuery } from "react-query";
import { useMemo, useState } from "react";
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
  let resp;
  const url = new URL(document.location.href);
  const selectedChannel = url.searchParams.get("channel");
  if (selectedChannel) {
    resp = await fetch(`/${charm}/integrations.json?channel=${selectedChannel}`);
  } else {
    resp = await fetch(`/${charm}/integrations.json`);
  }
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
  const [fragment, setFragment] = useState(window.location.hash || "");

  const { data } = useQuery(
    ["integrations", charm],
    () => getIntegrations(charm),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const integrationCount = useMemo(() => data?.length ?? 0, [data]);

  const filterValues = useMemo(
    () =>
      filterData
        .filter((item: IFilterChip) => item.lead === "Integration")
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

  const isActive = (id: string, index: number) => {
    const hash = fragment;

    if (!hash && index === 0) {
      return true;
    }

    if (hash && hash === id) {
      return true;
    }

    return false;
  };

  if (fragment) {
    const currentSection = document.querySelector(fragment);

    if (currentSection) {
      currentSection.scrollIntoView();
    }
  }

  const renderSideNav = (data: IInterfaceData[], type: string) => {
    const hasItems = data.some((interfaceItem: IInterfaceData) => interfaceItem.type === type);
    if (!hasItems) {
      return <></>;
    } else {
      return <>
        <h3 className="p-side-navigation__heading" style={{ paddingLeft: 0, paddingTop: 10 }}>{type.toUpperCase()}</h3>
        {data.map((interfaceItem: IInterfaceData, index) => {
          if (interfaceItem.type === type) {
            return (
              <li
                key={`${interfaceItem.key}|${interfaceItem.interface}`}
                className="p-side-navigation__item"
              >
                <a
                  className={`p-side-navigation__link ${
                    isActive(`#${interfaceItem.key}`, index) ? "is-active" : ""
                  }`}
                  href={`#${interfaceItem.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = e.target as HTMLLinkElement;
                    const targetElId = target.getAttribute("href");
  
                    if (targetElId) {
                      const targetEl = document.querySelector(targetElId);
                      targetEl?.scrollIntoView();
                      setFragment(targetElId);
                      window.location.hash = targetElId;
                      target.classList.add("is-active");
                    }
                  }}
                >
                  {`${interfaceItem.key}`}
                </a>
              </li>
            );
          }
          else {
            return <></>;
          }
        })}
      </>;
    }
  };

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
      {data && integrationCount > 0 && (
        <Row className="p-details-tab__content">
          <Col size={3} className="p-details-tab__content__sidebar">
            <div
              className="p-side-navigation"
              style={{ position: "sticky", top: "0" }}
            >
              <ul className="p-side-navigation__list">
                {filteredData && renderSideNav(filteredData, 'provides')}
                {filteredData && renderSideNav(filteredData, 'requires')}
              </ul>
            </div>
          </Col>
          <Col size={9} className="p-details-tab__content__body">
            <Row>
              <Col size={5}>
                <h2 className="p-heading--3 p-details-tab__content__body__title">
                  {integrationCount} integration
                  {integrationCount > 1 ? "s" : ""}
                </h2>
                <p className="p-heading--4 p-details-tab__content__body__link">
                  <a href="https://juju.is/docs/juju/relation">
                    Learn about integrations&nbsp;&gt;
                  </a>
                </p>
              </Col>
              <Col size={4}>
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    minHeight: "3rem",
                  }}
                >
                  <div style={{ position: "absolute", width: "100%" }}>
                    <SearchAndFilter
                      filterPanelData={availableFilters as any}
                      returnSearchData={(searchData: any) => {
                        setFilterData((prev) =>
                          prev !== searchData
                            ? (searchData as IFilterChip[])
                            : prev
                        );
                      }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
            {filteredData?.map((interfaceItem: IInterfaceData) => (
              <InterfaceItem
                key={`${interfaceItem.key}|${interfaceItem.interface}`}
                interfaceType={interfaceItem!.type!}
                interfaceData={interfaceItem}
                charmName={charm}
              />
            ))}
          </Col>
        </Row>
      )}
      {data && integrationCount === 0 && (
        <div className="p-strip u-no-padding--top">
          <div className="u-fixed-width u-equal-height">
            <div className="charm-empty-docs-icon u-vertically-center">
              <img src="https://assets.ubuntu.com/v1/8acd8f55-Integrations.svg" alt="" width="121" height="121" />
            </div>
            <div className="col-9 charm-empty-docs-content">
              <h4>No Integrations have been added for this charm</h4>
              <p>Integration is a connection an application supports by virtue of having a particular endpoint.</p>
              <p className="u-no-margin--bottom"><a className="p-button--positive u-no-margin--bottom" href="https://juju.is/docs/juju/relation">Learn how to manage charm integrations</a></p>
            </div>
          </div>
        </div>
      )}
    </Col>
  );
};

export default App;
