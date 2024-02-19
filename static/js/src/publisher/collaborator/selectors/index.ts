import { selector } from "recoil";

import { getFilteredCollaborators, getFilteredInvites } from "../utils";

import {
  collaboratorsListState,
  collaboratorsListFilterState,
  invitesListState,
} from "../atoms";

import type { Collaborator, Invite } from "../types";

const filteredCollaboratorsListState = selector<Array<Collaborator>>({
  key: "filteredCollaboratorsList",
  get: ({ get }) => {
    const filter = get(collaboratorsListFilterState);
    const collaborators = get(collaboratorsListState);

    return getFilteredCollaborators(collaborators, filter);
  },
});

const filteredInvitesListState = selector<Array<Invite>>({
  key: "filteredInvitesList",
  get: ({ get }) => {
    const filter = get(collaboratorsListFilterState);
    const invites = get(invitesListState);

    return getFilteredInvites(invites, filter);
  },
});

export { filteredCollaboratorsListState, filteredInvitesListState };
