import { atom } from "jotai";

import { getFilteredInvites, getFilteredCollaborators } from "../utils";

import {
  filterQueryState,
  collaboratorsListState,
  invitesListState,
} from "./atoms";

import type { Collaborator, Invite } from "../types";

export const filteredCollaboratorsListState = atom<Array<Collaborator>>(
  (get) => {
    const filterQuery = get(filterQueryState);
    const collaborators = get(collaboratorsListState);

    return getFilteredCollaborators(filterQuery, collaborators);
  }
);

export const filteredInvitesListState = atom<Array<Invite>>((get) => {
  const filterQuery = get(filterQueryState);
  const invites = get(invitesListState);

  return getFilteredInvites(filterQuery, invites);
});
