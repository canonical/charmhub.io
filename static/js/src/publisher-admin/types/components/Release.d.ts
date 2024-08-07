type Base = {
  architecture: string;
  channel: string;
  name: string;
};

type Revision = {
  bases: Base[];
  "created-at": string;
  revision: number;
  "sha3-384": string;
  size: number;
  status: string;
  version: string;
  errors: Error[] | null;
};

type Resource = {
  name: string;
  revision: number | null;
  type: string;
};

type Release = {
  resources: Resource[];
  revision: Revision;
};

type ReleaseChannel = {
  track: string;
  risk: string;
  releases: Release[];
};
