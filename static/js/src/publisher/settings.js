function initStickyMenu(selector) {
  const observerEl = document.querySelector(selector);

  if (observerEl) {
    const stickyEl = observerEl.querySelector("[data-js='sticky-menu']");
    let observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        stickyEl.classList.remove("is-sticky");
      } else {
        stickyEl.classList.add("is-sticky");
      }
    });

    observer.observe(observerEl);
  } else {
    throw new Error(`There is no element containing ${selector} selector.`);
  }
}

export { initStickyMenu };
