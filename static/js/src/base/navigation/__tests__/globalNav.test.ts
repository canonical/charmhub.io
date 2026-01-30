import "@testing-library/jest-dom";

import "./navigationTemplate";
import setUpNavigation from "./navigationTemplate";
import { patchAllCanonicalMobileMarkup } from "../globalNav";

describe("patchAllCanonicalMobileMarkup", () => {
  beforeEach(() => {
    vi.resetModules();
    setUpNavigation();
  });

  test("adds Back button items to mobile sections", () => {
    // run the function under test
    patchAllCanonicalMobileMarkup();

    const allMobile = document.getElementById("all-canonical-mobile")!;
    const sections = allMobile.querySelectorAll(".global-nav__dropdown-toggle");
    sections.forEach((section) => {
      const list = section.querySelector("ul") as HTMLUListElement;
      // list should have aria-hidden set and a prepended back button li
      expect(list).toBeTruthy();
      expect(list.getAttribute("aria-hidden")).toBe("true");

      const firstItem = list.firstElementChild as HTMLElement;
      expect(firstItem).toBeTruthy();
      expect(
        firstItem.classList.contains("p-navigation__item--dropdown-close")
      ).toBe(true);

      const backLink = firstItem.querySelector("a") as HTMLAnchorElement;
      expect(backLink).toBeTruthy();
      expect(backLink.classList.contains("js-back-button")).toBe(true);
      expect(backLink.textContent?.trim()).toBe("Back");
    });
  });
});
