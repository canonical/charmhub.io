import React from "react";
import { MainTable } from "@canonical/react-components";
import { format } from "date-fns";

import type { Collaborator, Publisher } from "../types";

type Props = {
  collaboratorsData: {
    collaborators: Array<Collaborator>;
    publisher: Publisher;
  };
};

function CollaboratorsTable({ collaboratorsData }: Props) {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "Users",
          heading: "Users",
        },
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
      rows={collaboratorsData.collaborators.map(
        (collaborator: Collaborator) => {
          return {
            columns: [
              {
                content: collaborator.account["display-name"],
              },
              {
                content: collaborator.account.email,
              },
              {
                content: collaborator["created-by"]["display-name"],
              },
              {
                content: format(
                  new Date(collaborator["created-at"]),
                  "dd/MM/yyyy"
                ),
              },
            ],
          };
        }
      )}
    />
  );
}

export default CollaboratorsTable;
