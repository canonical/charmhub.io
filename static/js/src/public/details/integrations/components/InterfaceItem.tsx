import type { IInterfaceData, ISearchAndFilter, IFilterChip } from "../types";
import type { ICharm } from "../../../../shared/types";

import { useEffect, useMemo } from "react";

import { useSetRecoilState, useRecoilValue } from "recoil";
import { useQuery } from "react-query";

import { Row, Col, Spinner, Chip } from "@canonical/react-components";

import { filterChipsSelector, filterState } from "../state";

import { IntegrationCard } from "@canonical/store-components";

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
    `/beta/store.json?${
      interfaceType === "provides" ? "requires" : "provides"
    }=${interfaceName}`
  );
  const json = await resp.json();
  return json.packages.filter((pkg: any) => pkg.name !== charmName);
};

const filterMap = (charm: ICharm, heading: string) => {
  switch (heading) {
    case "Platform":
      return charm.package["platforms"][0] === "vm"
        ? "Linux"
        : "Kubernetes";
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
  const setAvailableFilters = useSetRecoilState(filterChipsSelector);
  const filterData = useRecoilValue(filterState);

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
      <h3 className="p-heading--4 u-no-margin--bottom" id={interfaceData.key}>
        <div>
          {interfaceData.key}
          <span className="u-text--muted"> endpoint</span>
          {interfaceData.optional === "true" && (
            <Chip
              value="Required"
              appearance="negative"
              className="u-no-margin--bottom"
              style={{ marginLeft: '10px' }}
            />
          )}
        </div>
        <div>
          <a href={`/integrations/${interfaceData.interface}`}>
            {interfaceData.interface}
          </a>
          <span className="u-text--muted"> interface </span>
        </div>
      </h3>
      {interfaceData.description && <p>{interfaceData.description}</p>}

      {charms && charms?.length > 0 && (
        <>
          <div style={{ paddingTop: "0.5rem" }}>
            <p className="u-fixed-width u-no-margin--bottom">
              The <b>{interfaceData.key}</b> endpoint
              <b>{interfaceType === "requires" ? " requires " : " provides "}</b>
              an integration over the {" "}
              <a href={`/integrations/${interfaceData.interface}`}>
                {interfaceData.interface}
              </a>
              {" "} interface
            </p>
            <p>
              This means it can integrate with:
            </p>
          </div>
          <Row>
            {charms.map((charm: ICharm) => (
              <>
                <Col
                size={3}
                style={{ marginBottom: "1.5rem" }}
                key={charm.package["display_name"]}
                >
                  <IntegrationCard data={charm} />
                </Col>
              </>
            ))}
          </Row>
        </>
      )}
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
