function initTabs() {
  var tabLinks = document.querySelectorAll(".p-tabs__link");
  var contentTabs = document.querySelectorAll(".p-tabs__content");

  function setActiveTab() {
    var urlHash = window.location.hash;
    // hide all content tabs
    [].forEach.call(contentTabs, function (contentTab) {
      contentTab.classList.add("u-hide");
    });
    // deselect all navigation tabs
    [].forEach.call(tabLinks, function (link) {
      link.setAttribute("aria-selected", false);
    });

    if (urlHash) {
      // show selected content tab
      [].forEach.call(contentTabs, function (contentTab) {
        if ("#" + contentTab.id === urlHash) {
          contentTab.classList.remove("u-hide");
        }
      });
      // sselect the clicked navigation tab
      [].forEach.call(tabLinks, function (link) {
        if ("#" + link.getAttribute("aria-controls") === urlHash) {
          link.setAttribute("aria-selected", true);
        }
      });
    } else {
      // show first content tab
      contentTabs[0].classList.remove("u-hide");
      tabLinks[0].setAttribute("aria-selected", true);
    }
  }

  // prevent the page jumping around when switching tabs,
  // whilst still using :target
  // https://gist.github.com/pimterry/260841c2104f27cadc954a29b9873b96#file-disable-link-jump-with-workaround-js
  [].forEach.call(tabLinks, function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      history.pushState({}, "", link.href);

      // Update the URL again with the same hash, then go back
      history.pushState({}, "", link.href);
      history.back();

      setActiveTab();
    });
  });

  document.addEventListener("DOMContentLoaded", setActiveTab());

  window.addEventListener(
    "hashchange",
    function () {
      setActiveTab();
    },
    false
  );
}

initTabs();
