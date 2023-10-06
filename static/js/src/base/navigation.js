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

// initNavDropdowns(".p-navigation__item--dropdown-toggle");

function initNavigationSearch(element) {
  const searchButtons = element.querySelectorAll(".js-search-button");

  searchButtons.forEach((searchButton) => {
    searchButton.addEventListener("click", toggleSearch);
  });

  const menuButton = element.querySelector(".js-menu-button");
  if (menuButton) {
    menuButton.addEventListener("click", toggleMenu);
  }

  const overlay = element.querySelector(".p-navigation__search-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeAll);
  }

  function toggleMenu(e) {
    e.preventDefault();

    var navigation = e.target.closest(".p-navigation");
    if (navigation.classList.contains("has-menu-open")) {
      closeAll();
    } else {
      closeAll();
      openMenu(e);
    }
  }

  function toggleSearch(e) {
    e.preventDefault();

    var navigation = e.target.closest(".p-navigation");
    if (navigation.classList.contains("has-search-open")) {
      closeAll();
    } else {
      closeAll();
      openSearch(e);
    }
  }

  function openSearch(e) {
    e.preventDefault();
    var navigation = e.target.closest(".p-navigation");
    var searchInput = navigation.querySelector(".p-search-box__input");
    var buttons = document.querySelectorAll(".js-search-button");

    buttons.forEach((searchButton) => {
      searchButton.setAttribute("aria-pressed", true);
    });

    navigation.classList.add("has-search-open");
    searchInput.focus();
    searchInput.select();
    document.addEventListener("keyup", keyPressHandler);
  }

  function openMenu(e) {
    e.preventDefault();
    var navigation = e.target.closest(".p-navigation");
    var buttons = document.querySelectorAll(".js-menu-button");

    buttons.forEach((searchButton) => {
      searchButton.setAttribute("aria-pressed", true);
    });

    navigation.classList.add("has-menu-open");
    document.addEventListener("keyup", keyPressHandler);
  }

  function closeSearch() {
    var navigation = document.querySelector(".p-navigation");
    var buttons = document.querySelectorAll(".js-search-button");

    buttons.forEach((searchButton) => {
      searchButton.removeAttribute("aria-pressed");
    });

    navigation.classList.remove("has-search-open");
    document.removeEventListener("keyup", keyPressHandler);
  }

  function closeMenu() {
    var navigation = document.querySelector(".p-navigation");
    var buttons = document.querySelectorAll(".js-menu-button");

    buttons.forEach((searchButton) => {
      searchButton.removeAttribute("aria-pressed");
    });

    navigation.classList.remove("has-menu-open");
    document.removeEventListener("keyup", keyPressHandler);
  }

  function closeAll() {
    closeSearch();
    closeMenu();
  }

  function keyPressHandler(e) {
    if (e.key === "Escape") {
      closeAll();
    }
  }
}

var navigation = document.querySelector("#navigation");
initNavigationSearch(navigation);

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
