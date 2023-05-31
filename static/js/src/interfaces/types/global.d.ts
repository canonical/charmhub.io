import { InterfaceData, InterfaceItem } from "./types";

declare global {
  interface Window {
    initialProps: {
      interfacesList: Array<InterfaceItem>;
      interfaceItem: InterfaceData;
    };
  }
}
