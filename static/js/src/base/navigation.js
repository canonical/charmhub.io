function toggleDropdown(toggle, open) {
  const parentElement = toggle.parentNode;
  const dropdown = document.getElementById(
    toggle.getAttribute("aria-controls")
  );
  dropdown.setAttribute("aria-hidden", !open);

  if (open) {
    parentElement.classList.add("is-active", "is-selected");
  } else {
    parentElement.classList.remove("is-active", "is-selected");
  }
}

function closeAllDropdowns(toggles) {
  toggles.forEach((toggle) => {
    toggleDropdown(toggle, false);
  });
}

function handleClickOutside(toggles, containerClass) {
  document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.closest) {
      if (!target.closest(containerClass)) {
        closeAllDropdowns(toggles);
      }
    }
  });
}

function initNavDropdowns(containerClass) {
  const toggles = [].slice.call(
    document.querySelectorAll(containerClass + " [aria-controls]")
  );

  handleClickOutside(toggles, containerClass);

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();

      const isOpen = e.target.parentNode.classList.contains("is-active");

      closeAllDropdowns(toggles);
      toggleDropdown(toggle, !isOpen);
    });
  });
}

// Login
var navAccountContainer = document.querySelector(".js-nav-account");

if (navAccountContainer) {
  fetch("/account.json")
    .then((response) => response.json())
    .then((data) => {
      if (data.account) {
        var notAuthenticatedMenu = navAccountContainer.querySelector(
          ".js-nav-account--notauthenticated"
        );
        var authenticatedMenu = navAccountContainer.querySelector(
          ".js-nav-account--authenticated"
        );
        var displayName =
          navAccountContainer.querySelector(".js-account--name");
        navAccountContainer.classList.add(
          "p-navigation__item--dropdown-toggle"
        );
        notAuthenticatedMenu.classList.add("u-hide");
        authenticatedMenu.classList.remove("u-hide");
        displayName.innerHTML = data.account["display-name"];
        initNavDropdowns(".js-nav-account");
      }
    });
}

initNavDropdowns(".p-navigation__item--dropdown-toggle");
