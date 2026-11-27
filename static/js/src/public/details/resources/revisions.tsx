import { createRoot } from "react-dom/client";

import RevisionsTable from "./components/RevisionsTable";
import type { RevisionsData } from "./types";

// Data comes from the JSON embedded next to it, so nothing is fetched.
export function mountRevisionsTables(): void {
  document
    .querySelectorAll<HTMLScriptElement>(".js-revisions-data")
    .forEach((dataEl) => {
      const container =
        dataEl.parentElement?.querySelector<HTMLElement>(".js-revisions-root");

      if (!container || !dataEl.textContent) {
        return;
      }

      let data: RevisionsData;
      try {
        data = JSON.parse(dataEl.textContent);
      } catch {
        return;
      }

      createRoot(container).render(<RevisionsTable {...data} />);
    });
}

mountRevisionsTables();
