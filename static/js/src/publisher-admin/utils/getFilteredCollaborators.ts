import { Collaborator } from "../types";

export function getFilteredCollaborators(
  filterQuery: string | undefined,
  collaborators: Array<Collaborator>
) {
  if (!filterQuery) {
    return collaborators;
  }

  return collaborators.filter((collaborator) => {
    if (!collaborator.account) {
      return false;
    }

    return (
      collaborator.account?.["display-name"]?.includes(filterQuery) ||
      collaborator.account?.email?.includes(filterQuery)
    );
  });
}

export default getFilteredCollaborators;
