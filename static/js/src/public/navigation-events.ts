const currentOrigin = window.location.href;
const { dataLayer } = window as any;

// Main navigation
addGANavEvents("#navigation", "charmhub.io-nav-1");
// Footer events
addGANavEvents("footer", "charmhub.io-nav-footer");

function addGANavEvents(target: string, category: string) {
  const t = document.querySelector(target);
  if (t) {
    Array.from(t.querySelectorAll<HTMLAnchorElement>("a")).forEach((a) => {
      a.addEventListener("click", () => {
        dataLayer.push({
          event: "GAEvent",
          eventCategory: category,
          eventAction: "from:" + currentOrigin + " to:" + a.href,
          eventLabel: a.text.trim(),
          eventValue: undefined,
        });
      });
    });
  }
}

// Content events
addGAContentEvents("#main-content");

function addGAContentEvents(target: string) {
  const t = document.querySelector(target);
  if (t) {
    Array.from(t.querySelectorAll<HTMLAnchorElement>("a")).forEach((a) => {
      let category: string;
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
        a.addEventListener("click", () => {
          dataLayer.push({
            event: "GAEvent",
            eventCategory: category,
            eventAction: "from:" + currentOrigin + " to:" + a.href,
            eventLabel: a.text.trim().split("\n")[0],
            eventValue: undefined,
          });
        });
      }
    });
  }
}

export {};