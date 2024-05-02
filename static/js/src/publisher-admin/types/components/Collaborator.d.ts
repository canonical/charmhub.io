type Collaborator = {
  account: Publisher;
  "created-at": string;
  "created-by": Publisher;
  permissions: Array<string>;
  "updated-at": string | null;
};

export default Collaborator;
