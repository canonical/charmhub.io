import type { IInterfaceData, ISearchAndFilter, IFilterChip } from "../types";
import type { ICharm } from "../../../../shared/types";

import { useEffect, useMemo } from "react";

import { useSetRecoilState, useRecoilValue } from "recoil";
import { useQuery } from "react-query";

import { Row, Col, Spinner, Icon } from "@canonical/react-components";

import CharmCard from "../../../../shared/components/CharmCard";

import { filterChipsSelector, filterState } from "../state";

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
  const resp = await fetch(`/packages.json?${interfaceType}=${interfaceName}`);
  const json = await resp.json();
  return json.packages.filter((pkg: any) => pkg.name !== charmName);
};

const getInterfaces = async (): Promise<any> => {
  const resp = await fetch("/interfaces.json");
  const json = await resp.json();
  return json.interfaces ?? [];
};

const filterMap = (charm: ICharm, heading: string) => {
  switch (heading) {
    case "Platform":
      return charm.store_front["deployable-on"][0] === "vm"
        ? "Linux"
        : "Kubernetes";
    case "Stability":
      return charm["default-release"].channel.risk;
    case "Author":
      return charm.result.publisher["display-name"];
    case "Charm":
      return charm.store_front["display-name"];
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

  const { data: interfaces } = useQuery(["interfaces"], () => getInterfaces(), {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (
    interfaces &&
    interfaces.find((iface: any) => iface.name === interfaceData.interface)
  ) {
    console.log("FOUND");
  }

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
      <h3 className="p-heading--4 u-no-margin--bottom">
        {title}{" "}
        <span
          className="p-tooltip--right"
          aria-describedby={`${interfaceData.key}-${interfaceData.interface}-tooltip`}
        >
          <Icon name="information" />
          <span
            className="p-tooltip__message"
            role="tooltip"
            id={`${interfaceData.key}-${interfaceData.interface}-tooltip`}
          >
            Relation | Interface
          </span>
        </span>
      </h3>
      {interfaceData.description && <p>{interfaceData.description}</p>}

      {charms && charms?.length > 0 && (
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
      {!charms && (
        <div className="u-fixed-width">
          <Spinner text={`Loading charms for ${interfaceData.interface}`} />
        </div>
      )}
      {charms && charms.length === 0 && filterData.length === 0 && (
        <div className="u-fixed-width">
          <p>
            No charms found that <b>provide</b> or <b>consume</b>{" "}
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
