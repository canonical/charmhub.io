import { Invite } from "../types";

export function getFilteredInvites(
  filterQuery: string | undefined,
  invites: Array<Invite>
) {
  if (!filterQuery) {
    return invites;
  }

  return invites.filter((invite) => {
    if (!invite) {
      return false;
    }

    return invite?.email?.includes(filterQuery);
  });
}

export default getFilteredInvites;
