import { atom } from "recoil";

import type { Collaborator, Invite } from "../types";

const activeInviteState = atom({
  key: "activeInvite",
  default: "",
});

const actionState = atom({
  key: "action",
  default: "",
});

const inviteLinkState = atom({
  key: "inviteLink",
  default: "",
});

const collaboratorsListState = atom({
  key: "collaboratorsList",
  default: [] as Array<Collaborator>,
});

const collaboratorsListFilterState = atom({
  key: "collaboratorsListFilter",
  default: "" as string,
});

const invitesListState = atom({
  key: "invitesList",
  default: [] as Array<Invite>,
});

export {
  activeInviteState,
  actionState,
  inviteLinkState,
  collaboratorsListState,
  collaboratorsListFilterState,
  invitesListState,
};
