export const getNavigationTemplate = () => {
  const topDiv = document.createElement("div");
  // Keep the innerHTML in sync with the contents of templates/partial/_navigation.html
  // so that the tests are meaningful
  topDiv.innerHTML = `
    <header id="navigation" class="p-navigation--sliding is-dark">
      <div class="p-navigation__row--25-75">
        <div class="p-navigation__banner">
          <div class="p-navigation__tagged-logo">
            <a class="p-navigation__link" href="https://juju.is">
              <div class="p-navigation__logo-tag">
                <img class="p-navigation__logo-icon" src="https://assets.ubuntu.com/v1/a603c7c9-Favicon - Juju.svg" alt="Canonical Juju" />
              </div>
              <span class="p-navigation__logo-title">Canonical Juju</span>
            </a>
          </div>
          <ul class="p-navigation__items">
            <li class="p-navigation__item">
              <a href="#navigation" class="p-navigation__toggle--open" title="menu">Menu</a>
              <a href="#navigation-closed" class="p-navigation__toggle--close" title="close menu">Close menu</a>
            </li>
          </ul>
        </div>
        <nav class="p-navigation__nav">
          <div class="p-navigation__nav--wrapper">
            <ul class="p-navigation__items">
              <li class="p-navigation__item">
                <a class="p-navigation__link" href="http://juju.is/why-juju">How Juju Works</a>
              </li>
              <li class="p-navigation__item">
                <a class="p-navigation__link" href="/">Charmhub</a>
              </li>
              <li class="p-navigation__item--dropdown-toggle" id="community-link">
                <a class="p-navigation__link" href="#community-link-menu" aria-controls="community-link-menu">Community</a>
                <div class="p-navigation__dropdown--container">
                  <ul class="p-navigation__dropdown" id="community-link-menu" aria-hidden="true">
                    <li class="p-navigation__item--dropdown-close">
                      <a href="#community-link-menu" aria-controls="community-link-menu" class="p-navigation__link js-back-button">
                        Back
                      </a>
                    </li>
                    <li>
                      <a href="https://discourse.charmhub.io" class="p-navigation__dropdown-item">
                        Discourse forum
                      </a>
                    </li>
                    <li>
                      <a href="https://matrix.to/#/#charmhub:ubuntu.com" class="p-navigation__dropdown-item">
                        Matrix chat
                      </a>
                    </li>
                    <li>
                      <a class="p-navigation__dropdown-item" href="https://juju.is/operator-day">Operator Day</a>
                    </li>
                  </ul>
                </div>
              </li>
              <li class="p-navigation__item">
                <a class="p-navigation__link" href="https://juju.is/docs">Docs</a>
              </li>
              <li class="p-navigation__item">
                <a class="p-navigation__link" href="https://ubuntu.com/blog/tag/juju">Blog</a>
              </li>
            </ul>
            <div>
              <ul class="p-navigation__items global-nav">
                ${allCanonicalMobile}
                <li class="p-navigation__item p-navigation__item--dropdown-toggle js-nav-account js-nav-account--authenticated u-hide" id="user-link">
                  <a href="#user-link-menu" aria-controls="user-link-menu" class="p-navigation__link js-account--name account-name">My account</a>
                  <div class="p-navigation__dropdown--container">
                    <ul class="p-navigation__dropdown" id="user-link-menu" aria-hidden="true">
                      <li class="p-navigation__item--dropdown-close">
                        <a href="#user-link-menu" aria-controls="user-link-menu" class="p-navigation__link js-back-button">
                          Back
                        </a>
                      </li>
                      <li>
                        <a href="/charms" class="p-navigation__dropdown-item">My charms and bundles</a>
                      </li>
                      <li>
                        <a href="/logout" class="p-navigation__dropdown-item">Sign out</a>
                      </li>
                    </ul>
                  </div>
                </li>
                <li class="p-navigation__item js-nav-account js-nav-account--notauthenticated" role="menuitem">
                  <a class="p-navigation__link" href="/charms">
                    Sign in
                    <i class="p-icon--user is-light"></i>
                  </a>
                </li>
                <li class="p-navigation__item">
                  <a href="/all-search"
                    class="js-search-button p-navigation__link--search-toggle"
                    aria-label="Search"></a>
                </li>
              </ul>
              <div class="p-navigation__search">
                <form action="/all-search" class="p-search-box is-light">
                  <input type="search"
                          class="p-search-box__input"
                          name="q"
                          placeholder="Search Charmhub"
                          required=""
                          aria-label="Search Charmhub" />
                  <button type="reset" class="p-search-box__reset">
                    <i class="p-icon--close"></i>
                  </button>
                  <button type="submit" class="p-search-box__button">
                    <i class="p-icon--search"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div class="p-navigation__search-overlay"></div>
    </header>
  `;
  return topDiv;
};

const allCanonicalMobile = `
<li id="all-canonical-mobile" class="">
  <ul class="p-navigation__items">
    <li class="p-navigation__item--dropdown-toggle global-nav__dropdown-toggle">
      <button href="#products" class="p-navigation__link global-nav__header-link-anchor">Products</button>
      <ul id="products" class="p-navigation__dropdown" aria-hidden="true">
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/" tabindex="-1">Canonical</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/" tabindex="-1">Ubuntu</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/pro" tabindex="-1">Ubuntu Pro</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://snapcraft.io/" tabindex="-1">Snapcraft</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/lxd" tabindex="-1">LXD</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://maas.io/" tabindex="-1">MAAS</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/openstack" tabindex="-1">OpenStack</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/ceph" tabindex="-1">Ceph</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/kubernetes" tabindex="-1">Kubernetes</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://juju.is/" tabindex="-1">Juju</a>
        </li>
      </ul>
    </li>
    <li class="p-navigation__item--dropdown-toggle global-nav__dropdown-toggle">
      <button href="#also-from-canonical" class="p-navigation__link global-nav__header-link-anchor">Also from Canonical</button>
      <ul id="also-from-canonical" class="p-navigation__dropdown" aria-hidden="true">
        <li>
          <a class="p-navigation__dropdown-item" href="https://anbox-cloud.io/" tabindex="-1">Anbox Cloud</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://launchpad.net" tabindex="-1">Launchpad</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/download/cloud" tabindex="-1">Ubuntu on public clouds</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://multipass.run/" tabindex="-1">Multipass</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://cloud-init.io/" tabindex="-1">Cloud-init</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/landscape" tabindex="-1">Landscape</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="http://www.netplan.io/" tabindex="-1">Netplan</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://charmed-kubeflow.io/" tabindex="-1">Charmed Kubeflow</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://microcloud.is/" tabindex="-1">MicroCloud</a>
        </li>
      </ul>
    </li>
    <li class="p-navigation__item--dropdown-toggle global-nav__dropdown-toggle">
      <button href="#about" class="p-navigation__link global-nav__header-link-anchor">About</button>
      <ul id="about" class="p-navigation__dropdown u-no-margin--bottom" aria-hidden="true">
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/" tabindex="-1">Canonical</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/press-centre" tabindex="-1">Press centre</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/careers" tabindex="-1">Careers</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/blog" tabindex="-1">Blog</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://docs.ubuntu.com/" tabindex="-1">Documentation</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://ubuntu.com/engage" tabindex="-1">Resources</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/partners" tabindex="-1">Partners</a>
        </li>
        <li>
          <a class="p-navigation__dropdown-item" href="https://canonical.com/contact-us" tabindex="-1">Contact us</a>
        </li>
      </ul>
    </li>
  </ul>
</li>
`;

describe("Navigation Template", () => {
  test("Empty test", async () => {
    // Empty test so that this file doesn't fail because of lack of tests
  });
});
