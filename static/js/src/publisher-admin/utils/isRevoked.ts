import type { Invite } from "../types";

const isRevoked = (invite: Invite) => invite?.["revoked-at"] !== null;

export default isRevoked;
