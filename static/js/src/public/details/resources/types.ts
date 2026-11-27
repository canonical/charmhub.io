export type Revision = {
  revision: number;
  updated: string;
  checksum: string;
  checksum_full: string;
  size: string;
  is_default: boolean;
};

export type RevisionsData = {
  resourceName: string;
  resourceType: "oci-image" | "file";
  limit: number;
  revisions: Revision[];
};
