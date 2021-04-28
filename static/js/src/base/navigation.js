/**
  Toggles visibility of given subnav by toggling is-active class to it
  and setting aria-hidden attribute on dropdown contents.
  @param {HTMLElement} subnav Root element of subnavigation to open.
*/
function toggleSubnav(subnav, open) {
  if (open) {
    subnav.classList.add("is-active");
  } else {
    subnav.classList.remove("is-active");
  }

  var toggle = subnav.querySelector(".p-subnav__toggle");

  if (toggle) {
    var dropdown = document.getElementById(
      toggle.getAttribute("aria-controls")
    );

    if (dropdown) {
      dropdown.setAttribute("aria-hidden", open ? "true" : "false");
    }
  }
}

/**
  Closes all subnavs on the page.
*/
function closeAllSubnavs() {
  var subnavs = document.querySelectorAll(".p-subnav");
  for (var i = 0, l = subnavs.length; i < l; i++) {
    toggleSubnav(subnavs[i], false);
  }
}

/**
  Attaches click event listener to subnav toggle.
  @param {HTMLElement} subnavToggle Toggle element of subnavigation.
*/
function setupSubnavToggle(subnavToggle) {
  subnavToggle.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    var subnav = subnavToggle.parentElement;
    var isActive = subnav.classList.contains("is-active");

    closeAllSubnavs();
    if (!isActive) {
      toggleSubnav(subnav, true);
    }
  });

  // Close the subnav on Esc key press
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      var subnav = subnavToggle.parentElement;
      var isActive = subnav.classList.contains("is-active");

      if (isActive) {
        toggleSubnav(subnav, false);
      }
    }
  });
}

// Setup all subnav toggles on the page
var subnavToggles = document.querySelectorAll(".p-subnav__toggle");

for (var i = 0, l = subnavToggles.length; i < l; i++) {
  setupSubnavToggle(subnavToggles[i]);
}

// Close all menus if anything else on the page is clicked
document.addEventListener("click", function (event) {
  var target = event.target;

  if (target.closest) {
    if (
      !target.closest(".p-subnav__toggle") &&
      !target.closest(".p-subnav__item")
    ) {
      closeAllSubnavs();
    }
  } else if (target.msMatchesSelector) {
    // IE friendly `Element.closest` equivalent
    // as in https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    do {
      if (
        target.msMatchesSelector(".p-subnav__toggle") ||
        target.msMatchesSelector(".p-subnav__item")
      ) {
        return;
      }
      target = target.parentElement || target.parentNode;
    } while (target !== null && target.nodeType === 1);

    closeAllSubnavs();
  }
});

const enableResetSearchClick = (selector) => {
  const resetIconList = document.querySelectorAll(selector);

  if (resetIconList) {
    resetIconList.forEach((resetIcon) => {
      resetIcon.addEventListener("click", () => {
        window.location.href = "/";
      });
    });
  } else {
    console.error(`${selector} is not a valida element!`);
  }
};

// Enable sticky navigation
function enableStickyNav() {
  document.addEventListener("DOMContentLoaded", function () {
    var selector = "[data-js='sticky-nav-observer']";
    // select the observer element
    var observerEl = document.querySelector(selector);
    // select the navigation element
    var nav = document.getElementById("navigation");

    if (observerEl && nav) {
      // create a new observer
      var observer = new IntersectionObserver(
        function (entries) {
          // add "sticky" class if the observerEl is not on the screen
          if (entries[0].intersectionRatio === 0) {
            nav.classList.add("is-sticky");
            // remove "sticky" class if the observerEl is on the screen - i.e. you scrolled all the way to the top of the page
          } else if (entries[0].intersectionRatio === 1)
            nav.classList.remove("is-sticky");
        },
        { threshold: [0, 1] }
      );
      // ask the observer to observe the position of the observerEl - i.e. if it's on/off screen
      observer.observe(observerEl);
    } else {
      if (selector) {
        console.error(
          `${selector ? selector : "#navigation"} is not a valid element!`
        );
      }
    }
  });
}

enableStickyNav();
enableResetSearchClick("[data-js='reset-search']");

export { toggleSubnav };
