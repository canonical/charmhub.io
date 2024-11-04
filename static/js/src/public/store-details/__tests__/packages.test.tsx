import { initPackages } from "../packages";
import "@testing-library/jest-dom";

describe("initPackages", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test("should initialise and fetch package list", async () => {
    const mockPackages = { packages: [] };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => mockPackages,
    });

    await initPackages.initialize();

    expect(global.fetch).toHaveBeenCalledWith("/packages.json");
  });

  test("should parse URL filters", () => {
    window.history.pushState({}, "", "?base=test&type=demo&q=search");

    const filters = initPackages.getUrlFilters();
    expect(filters).toEqual({
      base: ["test"],
      type: ["demo"],
      filter: [],
      q: ["search"],
    });
  });

  test("should fetch package list with query", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => ({ packages: [] }),
    });

    const filters = { q: ["search"] };
    const spy = jest
      .spyOn(initPackages, "getUrlFilters")
      .mockReturnValue(filters);

    await initPackages.fetchPackageList();

    expect(global.fetch).toHaveBeenCalledWith("/packages.json?q=search");
    spy.mockRestore();
  });

  test("should handle bundle apps fetching and error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => ({ charms: [] }),
      ok: true,
    });

    const result = await initPackages.getBundleApps("bundle-name");
    expect(result).toEqual({ charms: [] });

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    await expect(initPackages.getBundleApps("bundle-name")).rejects.toThrow(
      "There was a problem communicating with the server."
    );
  });
});
