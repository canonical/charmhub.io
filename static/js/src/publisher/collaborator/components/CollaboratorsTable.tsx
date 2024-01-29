import React from "react";
import { MainTable } from "@canonical/react-components";
import { format } from "date-fns";

import type { Collaborator } from "../types";

type Props = {
  collaborators: Array<Collaborator>;
};

function CollaboratorsTable({ collaborators }: Props) {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "Email",
          heading: "Email",
        },
        {
          content: "Added by",
          heading: "Added by",
        },
        {
          content: "Accepted on",
          heading: "Accepted on",
          style: { width: "180px" },
        },
      ]}
      rows={collaborators.map((collaborator: Collaborator) => {
        return {
          columns: [
            {
              content: collaborator?.account_id,
            },
            {
              content: collaborator?.created_by,
            },
            {
              content: format(new Date(collaborator?.created_at), "dd/MM/yyyy"),
            },
          ],
        };
      })}
    />
  );
}

export default CollaboratorsTable;
