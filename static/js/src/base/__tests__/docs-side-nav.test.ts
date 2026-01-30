import "@testing-library/jest-dom";
import {
  toggleDrawer,
  setupSideNavigation,
  setupSideNavigations,
} from "../docs-side-nav";
import { fireEvent } from "@testing-library/react";

vi.mock("../docs-side-nav", async (importOriginal) => {
  const docsSideNav = await importOriginal<typeof import("../docs-side-nav")>();

  return {
    ...docsSideNav,
    toggleDrawer: vi.fn(docsSideNav.toggleDrawer),
    setupSideNavigation: vi.fn(docsSideNav.setupSideNavigation),
    setupSideNavigations: vi.fn(docsSideNav.setupSideNavigations),
  };
});

describe("toggleDrawer", () => {
  let sideNavigation: HTMLElement;
  let toggleButtonOutsideDrawer: HTMLElement;
  let toggleButtonInsideDrawer: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
        <div class="p-side-navigation" id="side-navigation">
          <button class="p-side-navigation__toggle" id="toggle-outside" aria-expanded="false"></button>
          <div class="p-side-navigation__drawer">
            <button class="p-side-navigation__toggle--in-drawer" id="toggle-inside" aria-expanded="false"></button>
          </div>
        </div>
      `;
    sideNavigation = document.getElementById("side-navigation") as HTMLElement;
    toggleButtonOutsideDrawer = document.getElementById(
      "toggle-outside"
    ) as HTMLElement;
    toggleButtonInsideDrawer = document.getElementById(
      "toggle-inside"
    ) as HTMLElement;

    // set initial state of the drawer to be expanded
    toggleDrawer(sideNavigation, true);
  });

  test("should expand the drawer", () => {
    expect(sideNavigation).toHaveClass("is-drawer-expanded");
    expect(sideNavigation).not.toHaveClass("is-drawer-collapsed");
    expect(toggleButtonInsideDrawer).toHaveFocus();
    expect(toggleButtonOutsideDrawer).toHaveAttribute("aria-expanded", "true");
    expect(toggleButtonInsideDrawer).toHaveAttribute("aria-expanded", "true");
  });

  test("should collapse the drawer", () => {
    toggleDrawer(sideNavigation, false);

    expect(sideNavigation).toHaveClass("is-drawer-collapsed");
    expect(sideNavigation).not.toHaveClass("is-drawer-expanded");
    expect(toggleButtonOutsideDrawer).toHaveFocus();
    expect(toggleButtonOutsideDrawer).toHaveAttribute("aria-expanded", "false");
    expect(toggleButtonInsideDrawer).toHaveAttribute("aria-expanded", "false");
  });
});

describe("setupSideNavigation", () => {
  let sideNavigation: HTMLElement;
  let toggleButtonOutsideDrawer: HTMLElement;
  let toggleButtonInsideDrawer: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = `
        <div class="p-side-navigation" id="side-navigation">
            <button class="js-drawer-toggle p-side-navigation__toggle" id="toggle-outside" aria-expanded="false"></button>
            <div class="p-side-navigation__drawer">
            <button class="js-drawer-toggle p-side-navigation__toggle--in-drawer" id="toggle-inside" aria-expanded="false"></button>
            </div>
        </div>
      `;
    sideNavigation = document.getElementById("side-navigation") as HTMLElement;
    toggleButtonOutsideDrawer = document.getElementById(
      "toggle-outside"
    ) as HTMLElement;
    toggleButtonInsideDrawer = document.getElementById(
      "toggle-inside"
    ) as HTMLElement;

    setupSideNavigation(sideNavigation);
  });

  test("should initially hide the navigation drawer", () => {
    expect(sideNavigation).toHaveClass("is-drawer-hidden");
  });

  test("should expand and collapse the drawer when toggle buttons are clicked", () => {
    // expand the drawer
    fireEvent.click(toggleButtonOutsideDrawer);

    expect(sideNavigation).toHaveClass("is-drawer-expanded");
    expect(sideNavigation).not.toHaveClass("is-drawer-collapsed");
    expect(sideNavigation).not.toHaveClass("is-drawer-hidden");
    expect(toggleButtonInsideDrawer).toHaveFocus();
    expect(toggleButtonOutsideDrawer).toHaveAttribute("aria-expanded", "true");
    expect(toggleButtonInsideDrawer).toHaveAttribute("aria-expanded", "true");

    // collapse the drawer
    fireEvent.click(toggleButtonInsideDrawer);

    expect(sideNavigation).toHaveClass("is-drawer-collapsed");
    expect(sideNavigation).not.toHaveClass("is-drawer-expanded");
    expect(toggleButtonOutsideDrawer).toHaveFocus();
    expect(toggleButtonOutsideDrawer).toHaveAttribute("aria-expanded", "false");
    expect(toggleButtonInsideDrawer).toHaveAttribute("aria-expanded", "false");
  });

  test("should collapse the drawer when the Escape key is pressed", () => {
    toggleDrawer(sideNavigation, true);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(sideNavigation).toHaveClass("is-drawer-collapsed");
    expect(toggleButtonOutsideDrawer).toHaveFocus();
    expect(toggleButtonOutsideDrawer).toHaveAttribute("aria-expanded", "false");
    expect(toggleButtonInsideDrawer).toHaveAttribute("aria-expanded", "false");
  });
});

describe("setupSideNavigations", () => {
  let mockSideNavigationElements: HTMLElement[];

  beforeEach(() => {
    vi.clearAllMocks();

    document.body.innerHTML = `
        <div class="p-side-navigation" id="side-navigation-1">
          <button class="js-drawer-toggle p-side-navigation__toggle" aria-expanded="false"></button>
          <div class="p-side-navigation__drawer"></div>
        </div>
        <div class="p-side-navigation" id="side-navigation-2">
          <button class="js-drawer-toggle p-side-navigation__toggle" aria-expanded="false"></button>
          <div class="p-side-navigation__drawer"></div>
        </div>
      `;

    mockSideNavigationElements = Array.from(
      document.querySelectorAll(".p-side-navigation")
    ) as HTMLElement[];

    mockSideNavigationElements.forEach((sideNav) => {
      setupSideNavigation(sideNav);
    });
  });

  test("should call setupSideNavigation for each side navigation element", () => {
    setupSideNavigations(".p-side-navigation");
    expect(setupSideNavigation).toHaveBeenCalledTimes(2);
    expect(setupSideNavigation).toHaveBeenCalledWith(
      mockSideNavigationElements[0]
    );
    expect(setupSideNavigation).toHaveBeenCalledWith(
      mockSideNavigationElements[1]
    );
  });

  test("should set up event listeners and initial state for each side navigation element", () => {
    // first side navigation element
    const firstSideNav = mockSideNavigationElements[0];
    expect(firstSideNav).toHaveClass("is-drawer-hidden");
    fireEvent.click(firstSideNav.querySelector(".js-drawer-toggle")!);
    expect(firstSideNav).toHaveClass("is-drawer-expanded");

    // second side navigation element
    const secondSideNav = mockSideNavigationElements[1];
    expect(secondSideNav).toHaveClass("is-drawer-hidden");
    fireEvent.click(secondSideNav.querySelector(".js-drawer-toggle")!);
    expect(secondSideNav).toHaveClass("is-drawer-expanded");
  });
});
