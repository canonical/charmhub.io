import { atom } from "recoil";

import { Collaborator, Publisher, Invite } from "./types";

export const filterQueryState = atom({
  key: "filterQuery",
  default: "" as string | undefined,
});

export const collaboratorsListState = atom({
  key: "collaboratorsList",
  default: [] as Array<Collaborator>,
});

export const publisherState = atom({
  key: "publisher",
  default: undefined as Publisher | undefined,
});

export const invitesListState = atom({
  key: "invitesList",
  default: [] as Array<Invite>,
});

export const activeInviteEmailState = atom({
  key: "activeInviteEmail",
  default: "" as string | undefined,
});

export const inviteLinkState = atom({
  key: "inviteLink",
  default: "" as string | undefined,
});

export const inviteEmailLinkState = atom({
  key: "inviteEmailLink",
  default: "" as string | undefined,
});
