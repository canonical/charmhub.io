import { useSetRecoilState, useRecoilValue } from "recoil";
import { format } from "date-fns";
import { MainTable, Button } from "@canonical/react-components";

import { publisherMatchesFilterQuery } from "../../utils";

import {
  filterQueryState,
  publisherState,
  activeInviteEmailState,
} from "../../state/atoms";
import { filteredCollaboratorsListState } from "../../state/selectors";

type Props = {
  setShowRevokeModal: (showRevokeModal: boolean) => void;
};

function Collaborators({ setShowRevokeModal }: Props) {
  const setActiveInviteEmail = useSetRecoilState(activeInviteEmailState);
  const collaboratorsList = useRecoilValue(filteredCollaboratorsListState);
  const filterQuery = useRecoilValue(filterQueryState);
  const publisher = useRecoilValue(publisherState);

  const publisherTableRow = {
    columns: [
      {
        content: (
          <>
            {publisher ? publisher?.["display-name"] : ""}&nbsp;&nbsp;
            <div className="p-status-label--information">Owner</div>
          </>
        ),
        className: "u-truncate",
      },
      {
        content: publisher ? publisher?.email : "",
        className: "u-truncate",
      },
      {
        content: "",
      },
      {
        content: "",
      },
    ],
  };

  const collaboratorTableRows = collaboratorsList.map((collaborator) => {
    return {
      columns: [
        {
          content: collaborator?.account?.["display-name"],
          className: "u-truncate",
        },
        {
          content: collaborator?.account?.email,
          className: "u-truncate",
        },
        {
          content:
            collaborator["created-at"] &&
            format(new Date(collaborator["created-at"]), "dd/MM/yyyy"),
        },
        {
          content: (
            <Button
              dense
              className="u-no-margin--bottom"
              onClick={() => {
                setShowRevokeModal(true);
                setActiveInviteEmail(collaborator?.account?.email);
              }}
            >
              Revoke
            </Button>
          ),
          className: "u-align--right",
        },
      ],
    };
  });

  let tableRows = collaboratorTableRows;

  if (publisher) {
    if (!filterQuery || publisherMatchesFilterQuery(publisher, filterQuery)) {
      tableRows = [publisherTableRow, ...collaboratorTableRows];
    }
  }

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
          content: "Accepted on",
          heading: "Accepted on",
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

export default Collaborators;
