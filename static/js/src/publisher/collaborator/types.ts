export type Publisher = {
  "display-name": string;
  email: string;
  id: string;
  username: string;
};

export type Collaborator = {
  account: Publisher;
  "created-at": string;
  "created-by": Publisher;
  permissions: Array<string>;
  "updated-at": string | null;
};

export type Invite = {
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  created_by: string;
  email: string;
  expires_at: string | null;
  invite_type: string;
  revoked_at: string | null;
  revoked_by: string | null;
};
