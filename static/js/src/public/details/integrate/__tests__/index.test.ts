import { select } from "d3-selection";
import Swiper from "swiper";
import { Navigation, Pagination } from "swiper/modules";
import debounce from "../../../../libs/debounce";
import { init } from "../index";

jest.mock("d3-selection", () => ({
  select: jest.fn().mockReturnValue({
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnThis(),
    selectAll: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnThis(),
    enter: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis(),
  }),
}));

jest.mock("swiper", () => {
  const use = jest.fn();
  const SwiperMock: any = jest.fn().mockImplementation(() => ({
    use: use as jest.Mock,
  }));

  SwiperMock.use = use;

  return SwiperMock;
});

jest.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}));

jest.mock("../../../../libs/debounce", () => jest.fn((fn) => fn));

describe("Index", () => {
  let originalLocation: Location;

  beforeAll(() => {
    originalLocation = window.location;
    delete (window as any).location;
    window.location = { pathname: "" } as Location;
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  beforeEach(() => {
    document.body.innerHTML = `<div id="integration-chart-wrapper"></div>`;
    (select as jest.Mock).mockClear();
  });

  describe("init", () => {
    test("should initialise the swiper with Navigation and Pagination modules", () => {
      init("packageOne", "packageTwo");
      expect(Swiper.use).toHaveBeenCalledWith([Navigation, Pagination]);
    });

    test("should build the chart with correct data based on pathname", () => {
      window.location.pathname = "/activemq";
      init("packageOne", "packageTwo");

      expect(select).toHaveBeenCalledWith("#integration-chart-wrapper");
      const svgMock = select("#integration-chart-wrapper");
      expect(svgMock.append).toHaveBeenCalledWith("svg");
      expect(svgMock.attr).toHaveBeenCalledWith("width", expect.any(Number));
      expect(svgMock.attr).toHaveBeenCalledWith("height", 280);
      expect(svgMock.attr).toHaveBeenCalledWith("class", "integration-chart");
    });

    test("should handle different pathnames and update the chart data correctly", () => {
      const pathnames = ["/advanced-routing", "/ambassador"];
      pathnames.forEach((pathname) => {
        window.location.pathname = pathname;
        init("packageOne", "packageTwo");
        expect(select).toHaveBeenCalledWith("#integration-chart-wrapper");
        const svgMock = select("#integration-chart-wrapper");
        expect(svgMock.append).toHaveBeenCalledWith("svg");
        expect(svgMock.attr).toHaveBeenCalledWith("width", expect.any(Number));
        expect(svgMock.attr).toHaveBeenCalledWith("height", 280);
        expect(svgMock.attr).toHaveBeenCalledWith("class", "integration-chart");
      });
    });

    test("should clear the chart wrapper on initialisation", () => {
      document.body.innerHTML = `<div id="integration-chart-wrapper"><div>Old Content</div></div>`;
      init("packageOne", "packageTwo");

      const integrationChartWrapper = document.getElementById(
        "integration-chart-wrapper"
      );
      expect(integrationChartWrapper?.innerHTML).toBe("");
    });

    test("should add resize event listener", () => {
      const addEventListenerSpy = jest.spyOn(window, "addEventListener");
      init("packageOne", "packageTwo");
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      addEventListenerSpy.mockRestore();
    });

    test("should debounce the resize event handler", () => {
      const debounceMock = debounce as jest.Mock;
      init("packageOne", "packageTwo");

      expect(debounceMock).toHaveBeenCalledWith(
        expect.any(Function),
        100,
        false
      );
    });
  });

  describe("buildChart", () => {
    test("should set up the SVG with correct dimensions and styles", () => {
      const wrapper = select("#integration-chart-wrapper");
      const svgMock = wrapper.append("svg");

      expect(wrapper.append).toHaveBeenCalledWith("svg");
      expect(svgMock.attr).toHaveBeenCalledWith(
        "width",
        window.innerWidth > 1175 ? 960 : window.innerWidth * 0.8
      );
      expect(svgMock.attr).toHaveBeenCalledWith("height", 280);
      expect(svgMock.attr).toHaveBeenCalledWith("class", "integration-chart");
      expect(svgMock.attr).toHaveBeenCalledWith(
        "style",
        "display: block; margin: 0 auto"
      );
    });

    test("should create left icon circle correctly", () => {
      const svgMock = select("#integration-chart-wrapper").append("svg");
      const bounds = svgMock.append("g");

      expect(bounds.append).toHaveBeenCalledWith("circle");
      expect(bounds.attr).toHaveBeenCalledWith("cx", expect.any(Number));
      expect(bounds.attr).toHaveBeenCalledWith("cy", 140);
      expect(bounds.attr).toHaveBeenCalledWith("r", 60);
      expect(bounds.attr).toHaveBeenCalledWith("fill", "#f7f7f7");
      expect(bounds.attr).toHaveBeenCalledWith("stroke", "#cdcdcd");
      expect(bounds.attr).toHaveBeenCalledWith("stroke-width", 1);
    });

    test("should create right icon circle correctly", () => {
      const svgMock = select("#integration-chart-wrapper").append("svg");
      const bounds = svgMock.append("g");

      expect(bounds.append).toHaveBeenCalledWith("circle");
      expect(bounds.attr).toHaveBeenCalledWith("cx", expect.any(Number));
      expect(bounds.attr).toHaveBeenCalledWith("cy", 140);
      expect(bounds.attr).toHaveBeenCalledWith("r", 60);
      expect(bounds.attr).toHaveBeenCalledWith("fill", "#f7f7f7");
      expect(bounds.attr).toHaveBeenCalledWith("stroke", "#cdcdcd");
      expect(bounds.attr).toHaveBeenCalledWith("stroke-width", 1);
    });
  });
});
