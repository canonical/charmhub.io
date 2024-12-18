import { Package, Publisher } from "../../publisher-admin/types";

export type Category = {
  display_name: string;
  name: string;
};

export type Store = {
  total_items: number;
  total_pages: number;
  packages: {
    categories: Category[];
    package: Package;
    publisher: Publisher;
    ratings: { count: string; value: string };
    id: string;
  }[];
  categories: Category[];
};
