import { CharmCard } from "@canonical/store-components";
import { createRoot } from "react-dom/client";

document
  .querySelectorAll<HTMLElement>("[data-solution-charm-card]")
  .forEach((container) => {
    const data = JSON.parse(container.dataset.solutionCharmCard!);
    createRoot(container).render(<CharmCard data={data} />);
  });
