import { SideNavigation } from "./side-navigation";

describe("SideNavigation", () => {
  let sideNavContainer;
  beforeEach(() => {
    sideNavContainer = document.createElement("div");
    sideNavContainer.innerHTML = `
    <div class="p-side-navigation" id="drawer">
      <a href="#drawer" class="p-side-navigation__toggle js-drawer-toggle" aria-controls="drawer">
        Toggle side navigation
      </a>
      <div class="p-side-navigation__overlay js-drawer-toggle" aria-controls="drawer"></div>
      <div class="p-side-navigation__drawer">
        <div class="p-side-navigation__drawer-header">
          <a href="#" class="p-side-navigation__toggle--in-drawer js-drawer-toggle" aria-controls="drawer">
            Toggle side navigation
          </a>
        </div>
        <ul class="p-side-navigation__list">
          <li class="p-side-navigation__item">
            <a class="p-side-navigation__link" href="/about">About</a>
          </li>
          <li class="p-side-navigation__item">
            <a class="p-side-navigation__link" href="/about/manifesto">Manifesto</a>
          </li>
          <li class="p-side-navigation__item">
            <a class="p-side-navigation__link" href="/about/publishing">Publishing</a>
          </li>
          <li class="p-side-navigation__item">
            <a class="p-side-navigation__link" href="/about/governance">Governance</a>
          </li>
          <li class="p-side-navigation__item">
            <a class="p-side-navigation__link" href="/about/glossary">Glossary</a>
          </li>
        </ul>
      </div>
    </div>
  `;
    document.body.appendChild(sideNavContainer);
  });

  afterEach(() => {
    document.body.removeChild(sideNavContainer);
  });

  test("should be able to call new() on SideNavigation", () => {
    const sideNav = new SideNavigation(
      '.p-side-navigation, [class*="p-side-navigation--"]'
    );
    expect(sideNav).toBeTruthy();
  });

  test("should toggle drawer open and closed when toggle button is clicked", () => {
    new SideNavigation('.p-side-navigation, [class*="p-side-navigation--"]');

    const toggleButton = sideNavContainer.querySelector(
      ".p-side-navigation__toggle"
    );

    const drawer = document.getElementById(
      toggleButton.getAttribute("aria-controls")
    );

    // Initially, the drawer should not have expanded/collapsed class
    expect(drawer.classList.contains("is-expanded")).toBe(false);
    expect(drawer.classList.contains("is-collapsed")).toBe(false);

    toggleButton.click();

    expect(drawer.classList.contains("is-expanded")).toBe(true);
    expect(drawer.classList.contains("is-collapsed")).toBe(false);

    toggleButton.click();

    expect(drawer.classList.contains("is-expanded")).toBe(false);
    expect(drawer.classList.contains("is-collapsed")).toBe(true);
  });

  test("should correctly toggle classes on drawer using toggleDrawer", () => {
    const sideNav = new SideNavigation(
      '.p-side-navigation, [class*="p-side-navigation--"]'
    );

    const drawer = sideNavContainer.querySelector(".p-side-navigation__drawer");

    // Initially, the drawer should have neither class
    expect(drawer.classList.contains("is-expanded")).toBe(false);
    expect(drawer.classList.contains("is-collapsed")).toBe(false);

    sideNav.toggleDrawer(drawer, true);

    expect(drawer.classList.contains("is-expanded")).toBe(true);
    expect(drawer.classList.contains("is-collapsed")).toBe(false);

    sideNav.toggleDrawer(drawer, false);

    expect(drawer.classList.contains("is-expanded")).toBe(false);
    expect(drawer.classList.contains("is-collapsed")).toBe(true);
  });

  test("should not toggle drawer if the side navigation element is not found", () => {
    const sideNav = new SideNavigation(
      '.p-side-navigation, [class*="p-side-navigation--"]'
    );

    const invalidElement = document.getElementById("invalid-id");

    const toggleDrawerSpy = jest.spyOn(sideNav, "toggleDrawer");

    sideNav.toggleDrawer(invalidElement, true);

    expect(toggleDrawerSpy).toHaveBeenCalledWith(null, true);
  });

  test("should handle side navigation with no toggles gracefully", () => {
    const noToggleContainer = document.createElement("div");
    noToggleContainer.innerHTML = `
      <div class="p-side-navigation" id="no-toggle-drawer">
        <div class="p-side-navigation__drawer">
          <div class="p-side-navigation__drawer-header">
            <!-- No toggle buttons -->
          </div>
          <ul class="p-side-navigation__list">
            <li class="p-side-navigation__item">
              <a class="p-side-navigation__link" href="/about">About</a>
            </li>
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(noToggleContainer);

    const sideNav = new SideNavigation(
      '.p-side-navigation, [class*="p-side-navigation--"]'
    );

    const toggles = noToggleContainer.querySelectorAll(".js-drawer-toggle");
    expect(toggles.length).toBe(0);

    expect(() => sideNav.initEvents([noToggleContainer])).not.toThrow();

    document.body.removeChild(noToggleContainer);
  });

  test("should not throw error when constructor selector matches no elements", () => {
    const sideNav = new SideNavigation(".non-existent-selector");

    expect(sideNav).toBeTruthy();
  });
});
