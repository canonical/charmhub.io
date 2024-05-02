type Invite = {
  "accepted-at": string | null;
  "accepted-by"?: Publisher;
  "created-at": string;
  "created-by": Publisher;
  email: string | null;
  "expires-at": string | null;
  "invite-type": string | null;
  "revoked-at": string | null;
};

export default Invite;
