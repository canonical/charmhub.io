import { atom, selector } from "recoil";

import type { IFilterChip, ISearchAndFilter } from "./types";

export const filterState = atom<IFilterChip[]>({
  key: "filterState",
  default: [],
});

export const filterChipsAtom = atom<ISearchAndFilter[]>({
  key: "filterChips",
  default: [],
});

export const filterChipsSelector = selector({
  key: "filterChipsSelector",
  get: ({ get }) => get(filterChipsAtom),
  set: ({ set, get }, newValue) => {
    const current = get(filterChipsAtom);
    // reduce newValue by id
    const newValues = (newValue as ISearchAndFilter[]).reduce(
      (acc, value) => {
        // Reduce on ID
        const match = acc.find((accItem) => accItem.id === value.id);
        if (!match) {
          acc.push(value);
        } else {
          // Reduce chips by value
          match.chips = [...match.chips, ...value.chips].reduce(
            (chipAcc, chipValue) => {
              const chipMatch = chipAcc.find(
                (chipAccItem) => chipAccItem.value === chipValue.value
              );
              if (!chipMatch) {
                chipAcc.push(chipValue);
              }
              return chipAcc;
            },
            [] as IFilterChip[]
          );
        }
        return acc;
      },
      current.map((item: ISearchAndFilter) => ({ ...item }))
    );

    set(filterChipsAtom, newValues);
  },
});
