import { useState } from "react";

import type { RevisionsData } from "../types";
import PaginationButton from "./PaginationButton";

function RevisionsTable({ resourceName, revisions, limit }: RevisionsData) {
  const [page, setPage] = useState(0);

  const total = revisions.length;
  const lastPage = Math.max(0, Math.ceil(total / limit) - 1);
  const start = page * limit;
  const pageRevisions = revisions.slice(start, start + limit);

  // All handlers clamp to [0, lastPage] so repeated clicks are no-ops
  const goFirst = () => setPage(0);
  const goPrevious = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(lastPage, p + 1));
  const goLast = () => setPage(lastPage);

  // The SVGs are there because those icons are available only in pragma.
  // They should be updated/removed once the page is migrated to use pragma.
  return (
    <>
      <table aria-label={`${resourceName} release history`}>
        <thead>
          <tr>
            <th>Resource revision</th>
            <th>Date</th>
            <th>Checksum</th>
          </tr>
        </thead>
        <tbody>
          {pageRevisions.map((revision) => {
            const label = `Copy checksum for revision ${revision.revision}`;
            return (
              <tr key={revision.revision}>
                <td>
                  {revision.is_default ? (
                    <i
                      className="p-icon--pin"
                      title="Default revision"
                      style={{ marginRight: "1rem" }}
                    >
                      Default revision
                    </i>
                  ) : (
                    <span style={{ display: "inline-block", width: "2rem" }} />
                  )}
                  {revision.revision}
                </td>
                <td>{revision.updated}</td>
                <td>
                  {revision.checksum}
                  <button
                    type="button"
                    className="p-button--base is-dense has-icon u-no-margin--bottom u-float-right"
                    data-js="copy"
                    data-copy={revision.checksum_full}
                    aria-label={label}
                    title={label}
                  >
                    <i className="p-icon--copy" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {total > limit && (
        <div className="u-align--right">
          <PaginationButton title="Skip to start of table" onClick={goFirst}>
            <svg
              className="u-vertical-align--middle"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8.187L12.187 14.374L13.248 13.314L8.121 8.187L13.248 3.061L12.187 2L6 8.187Z"
                fill="currentColor"
              />
              <path d="M3 2H4.5V15H3V2Z" fill="currentColor" />
            </svg>
          </PaginationButton>

          <PaginationButton
            title={`Previous ${limit} rows`}
            onClick={goPrevious}
          >
            <i
              className="p-icon--chevron-left u-vertical-align--middle"
              aria-hidden="true"
            ></i>
          </PaginationButton>

          <PaginationButton title={`Next ${limit} rows`} onClick={goNext}>
            <i
              className="p-icon--chevron-right u-vertical-align--middle"
              aria-hidden="true"
            ></i>
          </PaginationButton>

          <PaginationButton title="Skip to end of table" onClick={goLast}>
            <svg
              className="u-vertical-align--middle"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.248 8.813L4.061 2.626L3 3.686L8.127 8.813L3 13.939L4.061 15L10.248 8.813Z"
                fill="currentColor"
              />
              <path
                d="M13.248 15H11.748L11.748 2L13.248 2L13.248 15Z"
                fill="currentColor"
              />
            </svg>
          </PaginationButton>
        </div>
      )}
    </>
  );
}

export default RevisionsTable;
