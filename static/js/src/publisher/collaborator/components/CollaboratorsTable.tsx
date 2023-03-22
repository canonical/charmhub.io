import React from "react";
import { MainTable, Button } from "@canonical/react-components";
import { format } from "date-fns";

import { getCollaboratorById } from "../utils";

import type { Collaborator } from "../types";

type Props = {
  collaborators: Array<Collaborator>;
  setCollaboratorToRevoke: Function;
  setShowRevokeConfirmation: Function;
};

function CollaboratorsTable({
  collaborators,
  setCollaboratorToRevoke,
  setShowRevokeConfirmation,
}: Props) {
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
        {
          content: "",
          heading: "Actions",
          style: { width: "140px" },
        },
      ]}
      rows={collaborators.map((collaborator: Collaborator) => {
        return {
          columns: [
            {
              content: collaborator?.display_name,
            },
            {
              content: collaborator?.email,
            },
            {
              content: getCollaboratorById(
                collaborators,
                collaborator?.created_by
              )?.display_name,
            },
            {
              content: format(
                new Date(collaborator?.accepted_at),
                "dd/MM/yyyy"
              ),
            },
            {
              content: (
                <Button
                  dense
                  type="button"
                  className="u-no-margin--bottom"
                  onClick={() => {
                    setCollaboratorToRevoke(collaborator?.email);
                    setShowRevokeConfirmation(true);
                  }}
                >
                  Revoke
                </Button>
              ),
              className: "u-align--right",
            },
          ],
        };
      })}
    />
  );
}

export default CollaboratorsTable;
