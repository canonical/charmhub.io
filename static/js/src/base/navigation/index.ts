// This same code can be found duplicated in snapcraft.io
// If you modify these files for some reason it is likely that you will also need to modify snapcraft.io's ones

import setupLogin from "./login";

import { createNav as createAllCanonicalNav } from "@canonical/global-nav";
import { initNavigationListeners } from "./listeners";
import { patchAllCanonicalMobileMarkup } from "./globalNav";

// initialize global-nav ("All Canonical" link) and the rest of the navigation
window.addEventListener("DOMContentLoaded", function () {
  // keep the breakpoint in sync with $breakpoint-navigation-threshold in styles.scss
  createAllCanonicalNav({ breakpoint: 1220 });
  patchAllCanonicalMobileMarkup();
  initNavigationListeners();
  setupLogin();
});
