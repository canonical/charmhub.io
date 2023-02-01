export interface IInterfaceData {
  key: string;
  interface: string;
  description: string;
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
