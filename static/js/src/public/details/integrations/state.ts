import { atom } from "jotai";

import type { IFilterChip, ISearchAndFilter } from "./types";

export const filterState = atom<IFilterChip[]>([]);

export const filterChipsAtom = atom<ISearchAndFilter[]>([]);

export const filterChipsSelector = atom(
  (get) => get(filterChipsAtom),
  (get, set, newValue: ISearchAndFilter[]) => {
    const current = get(filterChipsAtom);
    const newValues = newValue.reduce(
      (acc, value) => {
        const match = acc.find((accItem) => accItem.id === value.id);
        if (!match) {
          acc.push(value);
        } else {
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
      current.map((item: ISearchAndFilter) => ({
        ...item,
        chips: [...item.chips],
      }))
    );

    set(filterChipsAtom, newValues);
  }
);
