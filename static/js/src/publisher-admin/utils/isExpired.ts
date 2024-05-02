import { isAfter } from "date-fns";

import type { Invite } from "../types";

const isExpired = (invite: Invite) =>
  invite?.["expires-at"] !== null &&
  isAfter(new Date(), new Date(invite?.["expires-at"]));

export default isExpired;
