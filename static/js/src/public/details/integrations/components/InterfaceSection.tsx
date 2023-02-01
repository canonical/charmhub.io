import type { IInterfaceData, IFilterChip } from "../types";

import { useMemo } from "react";
import { useRecoilValue } from "recoil";

import { filterState } from "../state";

import { InterfaceItem } from "./InterfaceItem";

interface InterfaceSectionProps {
  interfaceType: string;
  data: IInterfaceData[];
}

export const InterfaceSection = ({
  interfaceType,
  data,
}: InterfaceSectionProps) => {
  const filterData = useRecoilValue(filterState);
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
        : data.filter((item) => {
            const key = `${item.key}|${item.interface}`;
            return filterValues.includes(key);
          }),
    [data, filterValues]
  );

  return (
    <>
      {filteredData.map((interfaceItem: IInterfaceData) => (
        <InterfaceItem
          key={`${interfaceItem.key}|${interfaceItem.interface}`}
          interfaceType={interfaceType}
          interfaceData={interfaceItem}
        />
      ))}
    </>
  );
};
