import React from "react";
import { Button } from "@canonical/react-components";

type Props = {
  interfaceName: string | undefined;
  interfaceVersion: string;
};

function CanonicalRelationsMeta({ interfaceName, interfaceVersion }: Props) {
  return (
    <>
      <h2 className="p-muted-heading">Help us improve this page</h2>
      <p>
        Most of this content can be collaboratively discussed and changed in the
        respective README file.
      </p>
      <p>
        <Button
          element="a"
          href={`https://github.com/canonical/charm-relation-interfaces/blob/main/interfaces/${interfaceName}/${interfaceVersion}/README.md`}
          appearance="positive"
        >
          Contribute
        </Button>
      </p>
    </>
  );
}

export default CanonicalRelationsMeta;
