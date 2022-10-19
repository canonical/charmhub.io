import React from "react";
import { useNavigate } from "react-router-dom";
import { Strip, Button } from "@canonical/react-components";

import { useQuery } from "../utils";

function InviteConfirmation() {
  const packageName = window?.PACKAGE_NAME;
  let query: { get: Function } = useQuery();

  const navigate = useNavigate();

  const acceptInvite = () => {
    const formData = new FormData();

    formData.set("token", query.get("token"));
    formData.set("csrf_token", window.CSRF_TOKEN);

    fetch(`/${packageName}/collaboration/accept`, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (response.status === 200) {
        navigate(`/${packageName}/collaboration?accepted=true`);
      }
    });
  };

  const rejectInvite = () => {
    const formData = new FormData();

    formData.set("token", query.get("token"));
    formData.set("csrf_token", window.CSRF_TOKEN);

    fetch(`/${packageName}/collaboration/reject`, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (response.status === 200) {
        navigate(`/${packageName}/collaboration`);
      }
    });
  };

  return (
    <Strip>
      <h1>You have been invited to collaborate on this package.</h1>
      <div>
        <Button
          appearance="positive"
          onClick={() => {
            acceptInvite();
          }}
        >
          Accept invite
        </Button>
        <Button
          onClick={() => {
            rejectInvite();
          }}
        >
          Reject invite
        </Button>
      </div>
    </Strip>
  );
}

export default InviteConfirmation;
