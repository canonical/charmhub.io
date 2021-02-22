export class SideNavigation {
  constructor(selector: string) {
    const sideNavigations: NodeListOf<HTMLElement> = document.querySelectorAll(
      selector
    );

    if (sideNavigations) {
      this.initEvents(sideNavigations);
    }
  }

  initEvents(sideNavigations: NodeListOf<HTMLElement>) {
    // Setup all side navigations on the page.
    sideNavigations.forEach((sideNavigation) =>
      this.setupSideNavigation(sideNavigation)
    );
  }

  /**
    Attaches event listeners for the side navigation toggles
    @param {HTMLElement} sideNavigation The side navigation element.
  */
  setupSideNavigation(sideNavigation: HTMLElement) {
    const toggles = sideNavigation.querySelectorAll(".js-drawer-toggle");

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        const sideNav = document.getElementById(
          <string>toggle.getAttribute("aria-controls")
        );
        if (sideNav) {
          this.toggleDrawer(
            sideNav,
            !sideNav.classList.contains("is-expanded")
          )
        }
      });
    });
  }

  /**
    Toggles the expanded/collapsed classed on side navigation element.

    @param {HTMLElement} sideNavigation The side navigation element.
    @param {Boolean} show Whether to show or hide the drawer.
  */
  toggleDrawer(sideNavigation: HTMLElement, show: boolean) {
    if (sideNavigation) {
      if (show) {
        sideNavigation.classList.remove("is-collapsed");
        sideNavigation.classList.add("is-expanded");
      } else {
        sideNavigation.classList.remove("is-expanded");
        sideNavigation.classList.add("is-collapsed");
      }
    }
  }
}
