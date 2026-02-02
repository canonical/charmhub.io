import { getActiveNavItem, setActiveNavItem } from "../highlight-nav";

describe("highlight-nav", () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <nav>
        <a href="#home" class="p-side-navigation__link">Home</a>
        <a href="#about" class="p-side-navigation__link">About</a>
        <a href="#contact" class="p-side-navigation__link">Contact</a>
      </nav>
    `;
    container = document.querySelector("nav");
    vi.spyOn(window, "addEventListener");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getActiveNavItem", () => {
    test("should return the active navigation link based on the current hash", () => {
      window.location.hash = "#about";
      const navigationLinks = document.querySelectorAll(
        ".p-side-navigation__link"
      );
      const activeNavItem = getActiveNavItem(navigationLinks);

      expect(activeNavItem).not.toBeUndefined();
      expect(activeNavItem.getAttribute("href")).toBe("#about");
    });

    test("should return undefined if no navigation link matches the current hash", () => {
      window.location.hash = "#non-existent-link";
      const navigationLinks = document.querySelectorAll(
        ".p-side-navigation__link"
      );
      const activeNavItem = getActiveNavItem(navigationLinks);

      expect(activeNavItem).toBeUndefined();
    });
  });

  describe("setActiveNavItem", () => {
    test('should set aria-current to "page" for the active navigation link', () => {
      window.location.hash = "#contact";
      setActiveNavItem();

      const activeLink = container.querySelector('[aria-current="page"]');
      expect(activeLink).not.toBeNull();
      expect(activeLink.getAttribute("href")).toBe("#contact");
    });

    test("should remove aria-current from links that are not active", () => {
      window.location.hash = "#contact";
      setActiveNavItem();

      const linksWithoutAriaCurrent = Array.from(
        container.querySelectorAll(
          '.p-side-navigation__link:not([aria-current="page"])'
        )
      );
      linksWithoutAriaCurrent.forEach((link) => {
        expect(link.getAttribute("aria-current")).toBeNull();
      });
    });

    test("should handle no links correctly", () => {
      document.body.innerHTML = "<nav></nav>";
      setActiveNavItem();

      const links = container.querySelectorAll(".p-side-navigation__link");
      links.forEach((link) => {
        expect(link.getAttribute("aria-current")).toBeNull();
      });
    });
  });

  describe("Initialise highlight nav", () => {
    test("should call setActiveNavItem if window.location.hash is initially set", () => {
      window.location.hash = "#home";
      setActiveNavItem();

      const activeLink = container.querySelector('[aria-current="page"]');
      expect(activeLink.getAttribute("href")).toBe("#home");
    });

    test("should update active link on hashchange", () => {
      window.location.hash = "#home";
      setActiveNavItem();

      let activeLink = container.querySelector('[aria-current="page"]');
      expect(activeLink.getAttribute("href")).toBe("#home");

      window.location.hash = "#about";
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      activeLink = container.querySelector('[aria-current="page"]');
      expect(activeLink.getAttribute("href")).toBe("#about");
    });

    test("should not break if hashchange happens with no matching links", () => {
      window.location.hash = "#home";
      setActiveNavItem();

      window.location.hash = "#non-existent";
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      const activeLink = container.querySelector('[aria-current="page"]');
      expect(activeLink).toBeNull();
    });
  });
});
