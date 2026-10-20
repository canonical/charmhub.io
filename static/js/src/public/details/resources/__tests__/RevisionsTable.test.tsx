import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import RevisionsTable from "../components/RevisionsTable";
import type { Revision } from "../types";

function makeRevisions(total: number, defaultRevision = total): Revision[] {
  return Array.from({ length: total }, (_, i) => {
    const revision = total - i;
    return {
      revision,
      updated: "7 Aug 2024",
      checksum: `checksum-${revision}`,
      checksum_full: `full-checksum-${revision}`,
      is_default: revision === defaultRevision,
    };
  });
}

function renderTable(total: number, limit = 10) {
  return render(
    <RevisionsTable
      resourceName="vault-image"
      revisions={makeRevisions(total)}
      limit={limit}
    />
  );
}

const bodyRows = () =>
  screen
    .getByRole("table", { name: "vault-image release history" })
    .querySelectorAll("tbody tr");

describe("RevisionsTable", () => {
  const click = (name: string) =>
    fireEvent.click(screen.getByRole("button", { name }));

  // Revisions are rendered newest first, so the first cell holds the number
  const firstRevision = () => bodyRows()[0].querySelector("td")?.textContent;

  test("shows all revisions and no pagination when within the limit", () => {
    renderTable(5);

    expect(bodyRows()).toHaveLength(5);
    expect(
      screen.queryByRole("button", { name: "Next 10 rows" })
    ).not.toBeInTheDocument();
  });

  test("only shows the first page of revisions", () => {
    renderTable(25);

    expect(bodyRows()).toHaveLength(10);
    expect(firstRevision()).toContain("25");
  });

  test("next advances a page and shows the remainder on the last page", () => {
    renderTable(25);

    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(10);
    expect(firstRevision()).toBe("15");

    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(5);
    expect(firstRevision()).toBe("5");

    // Idempotent at the end
    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(5);
    expect(firstRevision()).toBe("5");
  });

  test("previous goes back a page and is idempotent at the start", () => {
    renderTable(25);

    click("Previous 10 rows");
    expect(firstRevision()).toContain("25");

    click("Next 10 rows");
    click("Next 10 rows");
    click("Previous 10 rows");
    expect(firstRevision()).toBe("15");
  });

  test("first and last jump to the ends and are idempotent", () => {
    renderTable(25);

    click("Skip to end of table");
    click("Skip to end of table");
    expect(bodyRows()).toHaveLength(5);
    expect(firstRevision()).toBe("5");

    click("Skip to start of table");
    click("Skip to start of table");
    expect(bodyRows()).toHaveLength(10);
    expect(firstRevision()).toContain("25");
  });

  test("uses the limit for page size", () => {
    renderTable(7, 3);

    expect(bodyRows()).toHaveLength(3);
    click("Skip to end of table");
    expect(bodyRows()).toHaveLength(1);
  });

  test("marks only the default revision", () => {
    renderTable(3);

    expect(screen.getAllByTitle("Default revision")).toHaveLength(1);
  });

  test("renders copy buttons handled by the delegated copy handler", () => {
    renderTable(2);

    const button = screen.getByRole("button", {
      name: "Copy checksum for revision 2",
    });
    expect(button).toHaveAttribute("data-js", "copy");
    expect(button).toHaveAttribute("data-copy", "full-checksum-2");
  });
});
