import type { IInterfaceData } from "../types";

import { InterfaceItem } from "./InterfaceItem";

interface InterfaceSectionProps {
  interfaceType: string;
  data: IInterfaceData[];
}

export const InterfaceSection = ({
  interfaceType,
  data,
}: InterfaceSectionProps) => {
  return (
    <>
      {data.map((interfaceItem: IInterfaceData) => (
        <InterfaceItem
          key={interfaceItem.key}
          interfaceType={interfaceType}
          interfaceData={interfaceItem}
        />
      ))}
    </>
  );
};
