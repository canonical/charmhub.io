export type SubSubSectionData = {
  heading: string;
  level: number;
  children: Array<string>;
};

export type SubSectionData = {
  heading: string;
  level: number;
  children: string | Array<SubSubSectionData>;
};

export type SectionData = {
  children: Array<SubSectionData>;
  heading: string;
  level: number;
};

export type InterfaceData = {
  body: Array<SectionData>;
  charms?: {
    requirers: Array<{
      name: string;
      url: string;
    }>;
    providers: Array<{
      name: string;
      url: string;
    }>;
  };
  other_charms?: {
    providers: Array<{
      id: string;
      name: string;
    }>;
    requirers: Array<{
      id: string;
      name: string;
    }>;
  };
  name: string;
  version: string;
  last_modified: string | null;
};
