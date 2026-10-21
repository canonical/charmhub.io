import type { CharmCard } from "@canonical/store-components";
import type { ComponentProps } from "react";
import type { Category } from "../../shared/types";

export type { Category } from "../../shared/types";

export type Store = {
  total_items: number;
  total_pages: number;
  packages: (ComponentProps<typeof CharmCard>["data"] & { id: string })[];
  categories: Category[];
};
