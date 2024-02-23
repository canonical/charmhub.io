import { selector } from "recoil";

import getFilteredCollaborators from "./utils/getFilteredCollaborators";
import getFilteredInvites from "./utils/getFilteredInvites";

import {
  filterQueryState,
  collaboratorsListState,
  invitesListState,
} from "./atoms";

import type { Collaborator, Invite } from "./types";

export const filteredCollaboratorsListState = selector<Array<Collaborator>>({
  key: "filteredCollaboratorsList",
  get: ({ get }) => {
    const filterQuery = get(filterQueryState);
    const collaborators = get(collaboratorsListState);

    return getFilteredCollaborators(filterQuery, collaborators);
  },
});

export const filteredInvitesListState = selector<Array<Invite>>({
  key: "filteredInvitesList",
  get: ({ get }) => {
    const filterQuery = get(filterQueryState);
    const invites = get(invitesListState);

    return getFilteredInvites(filterQuery, invites);
  },
});
