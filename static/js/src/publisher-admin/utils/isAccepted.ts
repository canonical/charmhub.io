import type { Invite } from "../types";

const isAccepted = (invite: Invite) => invite?.["accepted-at"] !== null;

export default isAccepted;
