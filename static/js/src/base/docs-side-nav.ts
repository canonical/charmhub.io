/**
Toggles the expanded/collapsed classed on side navigation element.

@param {HTMLElement} sideNavigation The side navigation element.
@param {Boolean} show Whether to show or hide the drawer.
*/
export function toggleDrawer(sideNavigation: HTMLElement, show: boolean) {
  const toggleButtonOutsideDrawer = sideNavigation.querySelector(
    ".p-side-navigation__toggle"
  ) as HTMLElement | null;
  const toggleButtonInsideDrawer = sideNavigation.querySelector(
    ".p-side-navigation__toggle--in-drawer"
  ) as HTMLElement | null;

  if (sideNavigation) {
    if (show) {
      sideNavigation.classList.remove("is-drawer-collapsed");
      sideNavigation.classList.add("is-drawer-expanded");

      toggleButtonInsideDrawer?.focus();
      toggleButtonOutsideDrawer?.setAttribute("aria-expanded", "true");
      toggleButtonInsideDrawer?.setAttribute("aria-expanded", "true");
    } else {
      sideNavigation.classList.remove("is-drawer-expanded");
      sideNavigation.classList.add("is-drawer-collapsed");

      toggleButtonOutsideDrawer?.focus();
      toggleButtonOutsideDrawer?.setAttribute("aria-expanded", "false");
      toggleButtonInsideDrawer?.setAttribute("aria-expanded", "false");
    }
  }
}

// throttle util (for window resize event)
export function throttle(fn: Function, delay: number) {
  let timer: number | null = null;
  return function (this: any, ...args: any[]) {
    const context = this;
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

/**
  Attaches event listeners for the side navigation toggles
  @param {HTMLElement} sideNavigation The side navigation element.
*/
export function setupSideNavigation(sideNavigation: HTMLElement) {
  const toggles = Array.from(
    sideNavigation.querySelectorAll(".js-drawer-toggle")
  ) as HTMLElement[];
  const drawerEl = sideNavigation.querySelector(
    ".p-side-navigation__drawer"
  ) as HTMLElement | null;

  // hide navigation drawer on small screens
  sideNavigation.classList.add("is-drawer-hidden");

  // setup drawer element
  drawerEl?.addEventListener("animationend", () => {
    if (!sideNavigation.classList.contains("is-drawer-expanded")) {
      sideNavigation.classList.add("is-drawer-hidden");
    }
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      toggleDrawer(sideNavigation, false);
    }
  });

  // setup toggle buttons
  toggles.forEach((toggle) => {
    (toggle as HTMLElement).addEventListener("click", (event: MouseEvent) => {
      event.preventDefault();

      if (sideNavigation) {
        sideNavigation.classList.remove("is-drawer-hidden");
        toggleDrawer(
          sideNavigation,
          !sideNavigation.classList.contains("is-drawer-expanded")
        );
      }
    });
  });

  // hide side navigation drawer when screen is resized
  window.addEventListener(
    "resize",
    throttle(() => {
      toggles.forEach((toggle: Element) => {
        return toggle.setAttribute("aria-expanded", "false");
      });
      // remove expanded/collapsed class names to avoid unexpected animations
      sideNavigation.classList.remove("is-drawer-expanded");
      sideNavigation.classList.remove("is-drawer-collapsed");
      sideNavigation.classList.add("is-drawer-hidden");
    }, 10)
  );
}

/**
  Attaches event listeners for all the side navigations in the document.
  @param {String} sideNavigationSelector The CSS selector matching side navigation elements.
*/
export function setupSideNavigations(sideNavigationSelector: string) {
  // Setup all side navigations on the page.
  const sideNavigations = Array.from(
    document.querySelectorAll(sideNavigationSelector)
  ) as HTMLElement[];

  sideNavigations.forEach(setupSideNavigation);
}

setupSideNavigations('.p-side-navigation, [class*="p-side-navigation--"]');

// Setup expandable side navigation

const expandToggles = document.querySelectorAll(
  ".p-side-navigation__expand"
) as NodeListOf<HTMLElement>;

// setup default values of aria-expanded for the toggle button, list title and list itself
const setup = (toggle: HTMLElement) => {
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  if (!isExpanded) {
    toggle.setAttribute("aria-expanded", "false");
  }
  const item = toggle.closest(".p-side-navigation__item") as HTMLElement | null;
  const link = item?.querySelector(
    ".p-side-navigation__link"
  ) as HTMLElement | null;
  const nestedList = item?.querySelector(
    ".p-side-navigation__list"
  ) as HTMLElement | null;
  if (!link?.hasAttribute("aria-expanded")) {
    link?.setAttribute("aria-expanded", isExpanded.toString());
  }
  if (!nestedList?.hasAttribute("aria-expanded")) {
    nestedList?.setAttribute("aria-expanded", isExpanded.toString());
  }
};

const handleToggle = (e: Event) => {
  const item = (e.currentTarget as HTMLElement).closest(
    ".p-side-navigation__item"
  ) as HTMLElement | null;
  const button = item?.querySelector(
    ".p-side-navigation__expand"
  ) as HTMLElement | null;
  const link = item?.querySelector(
    ".p-side-navigation__link"
  ) as HTMLElement | null;
  const nestedList = item?.querySelector(
    ".p-side-navigation__list"
  ) as HTMLElement | null;
  [button, link, nestedList].forEach((el) => {
    if (el) {
      el.setAttribute(
        "aria-expanded",
        el.getAttribute("aria-expanded") === "true" ? "false" : "true"
      );
    }
  });
};

expandToggles.forEach((toggle) => {
  setup(toggle);
  toggle.addEventListener("click", (e) => {
    handleToggle(e);
  });
});
