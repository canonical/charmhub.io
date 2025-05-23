function initSideNav() {
  const sideNav = document.getElementById("drawer");
  const path = window.location.pathname;
  if (!sideNav) {
    return;
  }
  const active = sideNav.querySelector(`a[href="${path}"]`);

  if (active) {
    active.setAttribute("aria-current", "page");
  }

  /**
    Toggles the expanded/collapsed classed on side navigation element.
    @param {HTMLElement} sideNavigation The side navigation element.
    @param {Boolean} show Whether to show or hide the drawer.
  */
  function toggleDrawer(sideNavigation, show) {
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

  /**
    Attaches event listeners for the side navigation toggles
    @param {HTMLElement} sideNavigation The side navigation element.
  */
  function setupSideNavigation(sideNavigation) {
    const toggles = [].slice.call(
      sideNavigation.querySelectorAll(".js-drawer-toggle")
    );

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (event) {
        event.preventDefault();
        const sideNav = document.getElementById(
          toggle.getAttribute("aria-controls")
        );

        if (sideNav) {
          toggleDrawer(sideNav, !sideNav.classList.contains("is-expanded"));
        }
      });
    });
  }

  setupSideNavigation(sideNav);

  // scroll active side navigation item into view (without scrolling whole page)
  const currentItem = sideNav.querySelector('[aria-current="page"]');

  if (sideNav && currentItem) {
    // calculate scroll by comparing top of side nav and top of active item
    const currentItemOffset = currentItem.getBoundingClientRect().top;
    const offset = currentItemOffset - sideNav.getBoundingClientRect().top;

    // only scroll if active link is off screen or close to bottom of the window
    setTimeout(function () {
      sideNav.scrollTop = offset;
    }, 0);
  }
}

export { initSideNav };
