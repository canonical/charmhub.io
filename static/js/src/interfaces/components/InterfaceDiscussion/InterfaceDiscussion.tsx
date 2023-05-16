import React from "react";
import { Button } from "@canonical/react-components";

function InterfaceDiscussion() {
  return (
    <>
      <h2 className="p-muted-heading">Discuss this interface</h2>
      <p>
        Share your thoughts on this interface with the community on discourse
      </p>
      <p>
        <Button
          element="a"
          href="https://discourse.charmhub.io/t/implementing-relations/1051"
        >
          Join the discussion
        </Button>
      </p>
    </>
  );
}

export default InterfaceDiscussion;
