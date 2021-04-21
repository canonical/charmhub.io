import { toggleSubnav } from "./navigation";

describe("toggleSubnav", () => {
  let navItem;

  beforeEach(() => {
    navItem = document.createElement("ul");
    navItem.innerHTML = `
      <li class="p-navigation__item p-subnav" id="contribute-link">
        <a href="#contribute-link-menu" aria-controls="contribute-link-menu" class="p-subnav__toggle p-navigation__link">Contribute</a>
        <ul class="p-subnav__items" id="contribute-link-menu" aria-hidden="true">
          <li>
            <p class="p-subnav__item is-title">Create a charmed operator</p>
          </li>
          <li>
            <a href="https://juju.is/docs/sdk/publishing" class="p-subnav__item">Publish an operator</a>
            <hr>
          </li>
          <li>
            <p class="p-subnav__item is-title">Join the comunity</p>
          </li>
          <li>
            <a href="http://discourse.charmhub.io" class="p-subnav__item">Forum</a>
          </li>
          <li>
            <a href="https://chat.charmhub.io/charmhub/channels/juju" class="p-subnav__item">Chat</a>
          </li>
          <li>
            <a href="http://bugs.launchpad.net/juju" class="p-subnav__item">Report a bug</a>
          </li>
          <li>
            <a href="https://juju.is/careers" class="p-subnav__item">Careers</a>
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
    const dropdown = document.getElementById("contribute-link-menu");

    expect(subnav.classList.contains("is-active")).toBeFalsy();
    expect(dropdown.getAttribute("aria-hidden")).toEqual("true");
  });

  it("should set the subnav to active", () => {
    const subnav = document.querySelector(".p-subnav");
    const dropdown = document.getElementById("contribute-link-menu");
    toggleSubnav(subnav, true);

    expect(subnav.classList.contains("is-active")).toBeTruthy();
    expect(dropdown.getAttribute("aria-hidden")).toEqual("true");
  });
});
