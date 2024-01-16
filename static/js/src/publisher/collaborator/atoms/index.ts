import { atom } from "recoil";

const inviteToRevokeState = atom({
  key: "inviteToRevoke",
  default: "",
});

export { inviteToRevokeState };
