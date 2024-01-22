import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Strip, Button } from "@canonical/react-components";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function InviteConfirmation() {
  const { packageName } = useParams();
  let query: { get: Function } = useQuery();

  const acceptInvite = () => {
    const formData = new FormData();

    formData.set("token", query.get("token"));
    formData.set("csrf_token", window.CSRF_TOKEN);

    fetch(`/${packageName}/collaboration/accept`, {
      method: "POST",
      body: formData,
    }).then((response) => {
      if (response.status === 200) {
        return response.json();
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
        return response.json();
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
