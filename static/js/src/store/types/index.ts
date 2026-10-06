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

export type SolutionCategory =
  | string
  | {
      display_name?: string;
      name?: string;
      slug?: string;
    };

export type Solution = {
  categories: SolutionCategory[];
  charm_icons?: Record<string, string>;
  charms: string[];
  icon: string | null;
  last_updated: string | null;
  name: string;
  platform: string;
  platform_version: string[];
  publisher: string;
  summary: string;
  title: string;
};
