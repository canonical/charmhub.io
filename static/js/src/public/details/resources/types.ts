export type Revision = {
  revision: number;
  updated: string;
  checksum: string;
  checksum_full: string;
  is_default: boolean;
};

export type RevisionsData = {
  resourceName: string;
  limit: number;
  revisions: Revision[];
};
