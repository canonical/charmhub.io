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
}

const getCharms = async (
  interfaceType: string,
  interfaceName: string
): Promise<ICharm[]> => {
  const resp = await fetch(`/packages.json?${interfaceType}=${interfaceName}`);
  const json = await resp.json();
  return json.packages;
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
}: InterfaceItemProps) => {
  const setAvailableFilters = useSetRecoilState(filterChipsSelector);
  const filterData = useRecoilValue(filterState);

  const { data } = useQuery(
    ["charms", interfaceType, interfaceData.interface],
    () => getCharms(interfaceType, interfaceData.interface)
  );

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
    setAvailableFilters(filters);
  }, [charms]);

  if (charms?.length === 0) {
    return null;
  }

  return (
    <>
      <hr />
      <h3 className="p-heading--4 u-no-margin--bottom">
        {interfaceData.key} | {interfaceData.interface}{" "}
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
      {charms && charms.length === 0 && (
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
