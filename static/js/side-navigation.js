(function() {
  const sideNavigation = document.querySelector("[data-js='side-navigation']");

  if (sideNavigation) {
    const sideNavigationIcons = [].slice.call(sideNavigation.querySelectorAll("[data-js='side-navigation-icon']"));
    
    if (sideNavigationIcons) {
      sideNavigationIcons.forEach(el => {
        if (el.parentElement) {
          el.addEventListener("click", () => {
            event.preventDefault();
            document.activeElement.blur();
            el.parentElement.classList.remove("is-active");
            el.classList.add("u-hide");
            window.history.pushState({}, "", "/");
          });

          // Reveal close icon on moseover and hide it on mouseout
          el.parentElement.addEventListener("mouseover", () => {
            if (el.parentElement.classList.contains("is-active")) {
              el.classList.remove("u-hide");
            }
          });
          el.parentElement.addEventListener("mouseout", () => {
            if (el.parentElement.classList.contains("is-active")) {
              el.classList.add("u-hide");
            }
          });
        }
      });
    }
  }
})();
