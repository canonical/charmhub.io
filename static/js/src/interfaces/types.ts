export type InterfaceData = {
  Behavior: {
    Introduction: string;
    Provider: Array<string>;
    Requirer: Array<string>;
  };
  Direction?: Array<string>;
  Relation?: {
    Provider: {
      Example: Array<string>;
      Introduction: string;
    };
    Requirer: {
      Example: Array<string>;
      Introduction: string;
    };
  };
  Usage: Array<string>;
  charms?: {
    consumers: Array<{
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
