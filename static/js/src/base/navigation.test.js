import { toggleSubnav } from "./navigation";

describe("toggleSubnav", () => {
  let navItem;

  beforeEach(() => {
    navItem = document.createElement("ul");
    navItem.innerHTML = `
      <li class="p-navigation__item p-subnav" role="menuitem" id="link-1">
        <a class="p-subnav__toggle p-navigation__link" aria-controls="account-menu">
          test@account.com
        </a>
        <ul class="p-subnav__items--right" id="account-menu" aria-hidden="false">
          <li>
            <a href="/test-route" class="p-subnav__item">Test route</a>
          </li>
          <li>
            <a href="/logout" class="p-subnav__item">Logout</a>
          </li>
        </ul>
      </li>`;

    document.body.appendChild(navItem);
  });

  afterEach(() => {
    document.body.removeChild(navItem);
  });

  it("should have the subnav inactive", () => {
    const subnav = document.querySelector(".p-subnav");
    const dropdown = document.getElementById("account-menu");

    expect(subnav.classList.contains("is-active")).toBeFalsy();
    expect(dropdown.getAttribute("aria-hidden")).toEqual("false");
  });

  it("should set the subnav to active", () => {
    const subnav = document.querySelector(".p-subnav");
    const dropdown = document.getElementById("account-menu");
    toggleSubnav(subnav, true);

    expect(subnav.classList.contains("is-active")).toBeTruthy();
    expect(dropdown.getAttribute("aria-hidden")).toEqual("true");
  });
});
