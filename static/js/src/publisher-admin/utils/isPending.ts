import { isAccepted, isRevoked, isExpired } from "../utils";

import type { Invite } from "../types";

const isPending = (invite: Invite) =>
  !isAccepted(invite) && !isRevoked(invite) && !isExpired(invite);

export default isPending;
