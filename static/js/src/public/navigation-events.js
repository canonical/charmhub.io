var origin = window.location.href;
const { dataLayer } = window;

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
