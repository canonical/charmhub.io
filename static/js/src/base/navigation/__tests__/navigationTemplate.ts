import fs from "fs";
import path from "path";

import { createNav } from "@canonical/global-nav";

let cachedTemplate: string | undefined;

const getNavigationTemplate = () => {
  if (cachedTemplate) {
    return cachedTemplate;
  }

  const file = path.join(
    __dirname,
    "../../../../../../",
    "templates/partial/_navigation.html"
  );
  cachedTemplate = fs.readFileSync(file, {
    encoding: "utf8",
  });
  return cachedTemplate;
};

export default function setUpNavigation() {
  document.body.innerHTML = getNavigationTemplate();
  createNav({ breakpoint: 1220 });
}

describe("Navigation Template", () => {
  test("Empty test", async () => {
    // Empty test so that this file doesn't fail because of lack of tests
  });
});
