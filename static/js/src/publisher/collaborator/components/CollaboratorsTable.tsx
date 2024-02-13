import React from "react";
import { MainTable, Button } from "@canonical/react-components";
import { format } from "date-fns";
import { useSetRecoilState } from "recoil";

import { activeInviteState, actionState } from "../atoms";

import type { Collaborator, Publisher } from "../types";

type Props = {
  collaboratorsData: {
    collaborators: Array<Collaborator>;
    publisher: Publisher;
  };
  setShowConfirmation: Function;
};

function CollaboratorsTable({ collaboratorsData, setShowConfirmation }: Props) {
  const setActiveInvite = useSetRecoilState(activeInviteState);
  const setAction = useSetRecoilState(actionState);

  const publisherRow = {
    columns: [
      {
        content: (
          <>
            {collaboratorsData.publisher["display-name"]}&nbsp;&nbsp;
            <div className="p-status-label--information">Owner</div>
          </>
        ),
        className: "u-truncate",
      },
      {
        content: collaboratorsData.publisher.email,
        className: "u-truncate",
      },
      {
        content: "",
      },
      {
        content: "",
      },
      {
        content: "",
      },
    ],
  };

  const collaboratorRows = collaboratorsData.collaborators.map(
    (collaborator: Collaborator) => {
      return {
        columns: [
          {
            content: collaborator.account["display-name"],
            className: "u-truncate",
          },
          {
            content: collaborator.account.email,
            className: "u-truncate",
          },
          {
            content: collaborator["created-by"]["display-name"],
            className: "u-truncate",
          },
          {
            content: format(new Date(collaborator["created-at"]), "dd/MM/yyyy"),
          },
          {
            className: "u-align--right",
            content: (
              <>
                <Button
                  type="button"
                  dense
                  onClick={() => {
                    setAction("Revoke");
                    setShowConfirmation(true);
                    setActiveInvite(collaborator?.account?.email);
                  }}
                >
                  Revoke
                </Button>
              </>
            ),
          },
        ],
      };
    }
  );

  const tableRows = [publisherRow, ...collaboratorRows];

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
        },
      ]}
      rows={tableRows}
    />
  );
}

export default CollaboratorsTable;
