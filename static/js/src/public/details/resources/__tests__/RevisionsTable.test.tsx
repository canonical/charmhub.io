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
      size: "10 Kb",
      checksum: `checksum-${revision}`,
      checksum_full: `full-checksum-${revision}`,
      is_default: revision === defaultRevision,
    };
  });
}

function renderTable(total: number, limit = 10, defaultRevision = total) {
  return render(
    <RevisionsTable
      resourceName="vault-image"
      resourceType="oci-image"
      revisions={makeRevisions(total, defaultRevision)}
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

  const revisionAt = (i: number) =>
    bodyRows()[i].querySelector("td")?.textContent;
  // The default revision is pinned at index 0, so the page starts at index 1
  const firstRevision = () => revisionAt(1);
  const pinnedCount = () => screen.queryAllByTitle("Default revision").length;

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
    expect(revisionAt(0)).toContain("25");
    expect(firstRevision()).toBe("24");
  });

  test("next advances a page and shows the remainder on the last page", () => {
    renderTable(25);

    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(10);
    expect(firstRevision()).toBe("15");

    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(7);
    expect(firstRevision()).toBe("6");

    // Idempotent at the end
    click("Next 10 rows");
    expect(bodyRows()).toHaveLength(7);
    expect(firstRevision()).toBe("6");
  });

  test("previous goes back a page and is idempotent at the start", () => {
    renderTable(25);

    click("Previous 10 rows");
    expect(firstRevision()).toBe("24");

    click("Next 10 rows");
    click("Next 10 rows");
    click("Previous 10 rows");
    expect(firstRevision()).toBe("15");
  });

  test("first and last jump to the ends and are idempotent", () => {
    renderTable(25);

    click("Skip to end of table");
    click("Skip to end of table");
    expect(bodyRows()).toHaveLength(7);
    expect(firstRevision()).toBe("6");

    click("Skip to start of table");
    click("Skip to start of table");
    expect(bodyRows()).toHaveLength(10);
    expect(firstRevision()).toBe("24");
  });

  test("uses the limit for page size", () => {
    renderTable(7, 3);

    expect(bodyRows()).toHaveLength(3);
    click("Skip to end of table");
    expect(bodyRows()).toHaveLength(3);
    expect(revisionAt(0)).toContain("7");
    expect(firstRevision()).toBe("2");
  });

  test("pins the default revision at the top of every page", () => {
    renderTable(25, 10, 12);

    expect(revisionAt(0)).toContain("12");
    expect(firstRevision()).toBe("25");
    expect(pinnedCount()).toBe(1);

    click("Next 10 rows");
    expect(revisionAt(0)).toContain("12");
    expect(firstRevision()).toBe("16");
    // 12 is not repeated in its natural position
    expect(revisionAt(5)).toBe("11");
    expect(pinnedCount()).toBe(1);

    click("Skip to end of table");
    expect(revisionAt(0)).toContain("12");
    expect(firstRevision()).toBe("6");
    expect(pinnedCount()).toBe(1);
  });

  test("paginates by the full limit when there is no default", () => {
    renderTable(25, 10, 0);

    expect(bodyRows()).toHaveLength(10);
    expect(revisionAt(0)).toBe("25");
    click("Skip to end of table");
    expect(bodyRows()).toHaveLength(5);
    expect(revisionAt(0)).toBe("5");
    expect(pinnedCount()).toBe(0);
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
