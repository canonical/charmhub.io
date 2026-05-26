import { atom } from "jotai";

import type { Package, Collaborator, Publisher, Invite } from "../types";

export const packageDataState = atom<Package | undefined>(undefined);

export const filterQueryState = atom<string | undefined>("");

export const collaboratorsListState = atom<Array<Collaborator>>([]);

export const publisherState = atom<Publisher | undefined>(undefined);

export const invitesListState = atom<Array<Invite>>([]);

export const activeInviteEmailState = atom<string | undefined>("");

export const inviteLinkState = atom<string | undefined>("");

export const inviteEmailLinkState = atom<string | undefined>("");
