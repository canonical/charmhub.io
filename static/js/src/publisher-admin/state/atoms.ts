import { atom } from "recoil";

import type { Package } from "../types";

export const packageDataState = atom<Package | undefined>({
  key: "packageData",
  default: undefined,
});
