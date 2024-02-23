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
  "accepted-at": string | null;
  "accepted-by"?: Publisher;
  "created-at": string;
  "created-by": Publisher;
  email: string | null;
  "expires-at": string | null;
  "invite-type": string | null;
  "revoked-at": string | null;
};
