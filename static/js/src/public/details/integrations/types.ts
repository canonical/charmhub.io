export interface IInterfaceData {
  key: string;
  interface: string;
  description: string;
  type?: "provides" | "requires";
  optional?: "true" | "false";
}

export interface IFilterChip {
  lead: string;
  value: string;
}

export interface ISearchAndFilter {
  id: string;
  heading: string;
  chips: IFilterChip[];
}
