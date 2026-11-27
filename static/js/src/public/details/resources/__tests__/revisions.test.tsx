import { act } from "react";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { mountRevisionsTables } from "../revisions";

function section(name: string, total: number) {
  const revisions = Array.from({ length: total }, (_, i) => ({
    revision: total - i,
    updated: "7 Aug 2024",
    checksum: "abc",
    checksum_full: "abcdef",
    is_default: i === 0,
  }));

  return `
    <section id="${name}">
      <div class="js-revisions-root"><p>server-rendered ${name}</p></div>
      <script type="application/json" class="js-revisions-data">
        ${JSON.stringify({ resourceName: name, limit: 10, revisions })}
      </script>
    </section>`;
}

describe("mountRevisionsTables", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("mounts a table per resource from the embedded data", async () => {
    document.body.innerHTML = section("a", 25) + section("b", 3);

    await act(async () => mountRevisionsTables());

    expect(screen.queryByText(/server-rendered/)).toBeNull();
    const rows = (name: string) =>
      screen
        .getByRole("table", { name: `${name} release history` })
        .querySelectorAll("tbody tr");
    expect(rows("a")).toHaveLength(10);
    expect(rows("b")).toHaveLength(3);
  });
});
