import type { InterfaceData } from "../types";

export const mockRequiringCharmsData: InterfaceData = {
  name: "Test Interface",
  version: "1.0",
  body: [],
  charms: {
    providers: [],
    requirers: [
      { name: "Requirer1", url: "http://example.com/requirer1" },
      { name: "Requirer2", url: "http://example.com/requirer2" },
    ],
  },
  other_charms: {
    providers: [],
    requirers: [
      { id: "other1", name: "Other Charm 1" },
      { id: "other2", name: "Other Charm 2" },
    ],
  },
  last_modified: null,
};

export const mockProvidingCharmsData: InterfaceData = {
  name: "Test Interface",
  version: "1.0",
  body: [],
  charms: {
    providers: [
      { name: "Provider1", url: "http://example.com/provider1" },
      { name: "Provider2", url: "http://example.com/provider2" },
    ],
    requirers: [],
  },
  other_charms: {
    providers: [
      { id: "other1", name: "Other Charm 1" },
      { id: "other2", name: "Other Charm 2" },
    ],
    requirers: [],
  },
  last_modified: null,
};

export const noCharmsData: InterfaceData = {
  name: "Test Interface",
  version: "1.0",
  body: [],
  charms: { providers: [], requirers: [] },
  other_charms: { providers: [], requirers: [] },
  last_modified: null,
};
