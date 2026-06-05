import type { IInterfaceData, ISearchAndFilter, IFilterChip } from "../types";
import type { ICharm } from "../../../../shared/types";

import { useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "react-query";

import { Row, Col, Spinner, Chip } from "@canonical/react-components";

import { filterChipsSelector, filterState } from "../state";
import { InerfaceRow } from "./InerfaceRow";

interface InterfaceItemProps {
  interfaceType: string;
  interfaceData: IInterfaceData;
  charmName: string;
}

const getCharms = async (
  interfaceType: string,
  interfaceName: string,
  charmName: string
): Promise<ICharm[]> => {
  const resp = await fetch(
    `/store.json?${
      interfaceType === "provides" ? "requires" : "provides"
    }=${interfaceName}`
  );
  const json = await resp.json();
  return (json.packages as ICharm[]).filter(
    (pkg: ICharm) => pkg.package.name !== charmName
  );
};

const filterMap = (charm: ICharm, heading: string) => {
  switch (heading) {
    case "Platform":
      return charm.package["platforms"][0] === "vm" ? "Linux" : "Kubernetes";
    case "Stability":
      return charm.package["channel"]["risk"];
    case "Author":
      return charm.publisher["display_name"];
    case "Charm":
      return charm.package["display_name"];
    default:
      return "";
  }
};

export const InterfaceItem = ({
  interfaceType,
  interfaceData,
  charmName,
}: InterfaceItemProps) => {
  const setAvailableFilters = useSetAtom(filterChipsSelector);
  const filterData = useAtomValue(filterState);

  const { data } = useQuery(
    ["charms", interfaceType, interfaceData.interface],
    () => getCharms(interfaceType, interfaceData.interface, charmName),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const title = `${interfaceData.key} | ${interfaceData.interface}`;

  const charms = useMemo(() => {
    if (filterData.length === 0 || data?.length === 0) {
      return data;
    }
    return data?.filter((charm: ICharm) => {
      return filterData.every((filter: IFilterChip) => {
        if (filter.lead === "Integration") {
          return true;
        }
        const value = filterMap(charm, filter.lead);
        return value === filter.value;
      });
    });
  }, [data, filterData]);

  useEffect(() => {
    if (!charms) {
      return;
    }
    const headings = ["Platform", "Stability", "Author", "Charm"];
    // Add charms
    const filters = charms.reduce<ISearchAndFilter[]>(
      (acc: ISearchAndFilter[], charm: ICharm) => {
        headings.forEach((heading) => {
          const chip: IFilterChip = { lead: heading, value: "" };
          chip.value = filterMap(charm, heading);
          const currentObj = {
            id: heading,
            heading,
            chips: [chip],
          };
          acc.push(currentObj);
        });

        return acc;
      },
      [] as ISearchAndFilter[]
    );

    // Integrations
    let integrations = filters.find((item) => item.heading === title);
    if (!integrations) {
      integrations = {
        id: "Integration",
        heading: "Integration",
        chips: [],
      };
      filters.unshift(integrations);
    }
    if (!integrations.chips.find((item) => item.value === title)) {
      integrations.chips.push({
        lead: "Integration",
        value: title,
      });
    }
    setAvailableFilters(filters);
  }, [charms]);

  return (
    <>
      <hr />
      <Row>
        <Col size={5}>
          <h3
            className="p-heading--4 u-no-margin--bottom"
            id={interfaceData.key}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {interfaceData.key}
              <span className="u-text--muted">&nbsp;endpoint</span>
              {interfaceData.required === true && (
                <Chip
                  isReadOnly
                  value="Required"
                  appearance="negative"
                  className="u-no-margin--bottom"
                  style={{ marginLeft: "10px" }}
                />
              )}
            </div>
            <div>
              <a href={`/integrations/${interfaceData.interface}`}>
                {interfaceData.interface}
              </a>
              <span className="u-text--muted">&nbsp;interface</span>
            </div>
          </h3>
        </Col>
        <Col size={4}>
          <p className="u-fixed-width u-no-margin--bottom">
            The <b>{interfaceData.key}</b> endpoint
            <b>{interfaceType === "requires" ? " requires " : " provides "}</b>
            an integration over the{" "}
            <a href={`/integrations/${interfaceData.interface}`}>
              {interfaceData.interface}
            </a>{" "}
            interface
          </p>
          <p>This means it can integrate with:</p>
        </Col>
      </Row>

      <Row>
        <Col emptyLarge={2} size={9}>
          {charms && charms?.length > 0 && (
            <ul className="p-list--divided">
              {charms.map((charm: ICharm, idx) => (
                <li key={charm.package.name} className="p-list__item">
                  {idx === 0 && <hr />}
                  <InerfaceRow charm={charm} />
                </li>
              ))}
            </ul>
          )}
        </Col>
      </Row>
      {!charms && (
        <div className="u-fixed-width">
          <Spinner text={`Loading charms for ${interfaceData.interface}`} />
        </div>
      )}
      {charms && charms.length === 0 && filterData.length === 0 && (
        <div className="u-fixed-width">
          <p>
            No charms found that{" "}
            <b>{interfaceType === "requires" ? "require" : "provide"}</b>{" "}
            {interfaceData.interface}
          </p>
        </div>
      )}
      {charms && charms.length === 0 && filterData.length !== 0 && (
        <div className="u-fixed-width">
          <p>
            No charms found that <b>provide</b> or <b>consume</b>{" "}
            {interfaceData.interface} matching your selected filters.
          </p>
        </div>
      )}
    </>
  );
};
