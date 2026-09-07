import type { CharmCard } from "@canonical/store-components";
import type { ComponentProps } from "react";

export type Category = {
  display_name: string;
  name: string;
};

export type Store = {
  total_items: number;
  total_pages: number;
  packages: (ComponentProps<typeof CharmCard>["data"] & { id: string })[];
  categories: Category[];
};
