function getActiveNavItem(navigationLinks) {
  return Array.from(navigationLinks).find((navigationLink) => {
    return navigationLink.getAttribute("href") === window.location.hash;
  });
}

function setActiveNavItem() {
  const navigationLinks = document.querySelectorAll(".p-side-navigation__link");
  const activeNavItem = getActiveNavItem(navigationLinks);

  Array.from(navigationLinks).forEach((navigationLink) => {
    if (navigationLink === activeNavItem) {
      navigationLink.setAttribute("aria-current", "page");
    } else {
      navigationLink.removeAttribute("aria-current");
    }
  });
}

if (window.location.hash) {
  setActiveNavItem();
}

window.addEventListener("hashchange", setActiveNavItem);
