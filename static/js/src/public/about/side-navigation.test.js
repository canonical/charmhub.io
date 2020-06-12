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

  it("should be able to call new() on SideNavigation", () => {
    const sideNav = new SideNavigation(
      '.p-side-navigation, [class*="p-side-navigation--"]'
    );
    expect(sideNav).toBeTruthy();
  });
});
