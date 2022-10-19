import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import type { Collaborator } from "./types";

function getCollaboratorById(
  collaborators: Array<Collaborator>,
  accountId: string
) {
  return collaborators.find(
    (collaborator) => collaborator?.account_id === accountId
  );
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export { getCollaboratorById, useQuery };
