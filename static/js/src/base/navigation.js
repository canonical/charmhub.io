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
      dropdown.setAttribute("aria-hidden", open ? "true" : false);
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

export { toggleSubnav };

var origin = window.location.href;

// Main navigation
addGANavEvents("#navigation", "charmhub.io-nav-1");
// Footer events
addGANavEvents("footer", "charmhub.io-nav-footer");

function addGANavEvents(target, category) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      a.addEventListener("click", function () {
        dataLayer.push({
          event: "GAEvent",
          eventCategory: category,
          eventAction: "from:" + origin + " to:" + a.href,
          eventLabel: a.text.trim(),
          eventValue: undefined,
        });
      });
    });
  }
}

// Content events
addGAContentEvents("#main-content");

function addGAContentEvents(target) {
  var t = document.querySelector(target);
  if (t) {
    [].slice.call(t.querySelectorAll("a")).forEach(function (a) {
      let category;
      // Primary CTA
      if (a.classList.contains("p-button--positive")) {
        category = "charmhub.io-content-cta-0";
      // Secondary CTA
      } else if (a.classList.contains("p-button")) {
        category = "charmhub.io-content-cta-1";
      // Listing navigation
      } else if (a.classList.contains("p-tabs__link")) {
        category = "charmhub.io-nav-listing";
      // Content cards
      } else if (a.classList.contains("p-card--button")) {
        category = "charmhub.io-content-card";
      } else {
      // Other text links
        category = "charmhub.io-content-link";
      }
      if (!a.href.startsWith("#")) {
        a.addEventListener("click", function () {
          dataLayer.push({
            event: "GAEvent",
            eventCategory: category,
            eventAction: "from:" + origin + " to:" + a.href,
            eventLabel: a.text.trim().split("\n")[0],
            eventValue: undefined,
          });
        });
      }
    });
  }
}
