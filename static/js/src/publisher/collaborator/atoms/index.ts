import { atom } from "recoil";

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

export { activeInviteState, actionState, inviteLinkState };
