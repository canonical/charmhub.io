import { init } from "../list-page";
import { WeeklyActiveDevicesTrend } from "../graphs/activeDevices";
import initCloseButton from "../../libs/notification-close";

jest.mock("../graphs/activeDevices", () => ({
  WeeklyActiveDevicesTrend: jest.fn().mockImplementation(() => ({
    render: jest.fn().mockReturnThis(),
    show: jest.fn().mockReturnThis(),
    _prepareSVG: jest.fn().mockReturnThis(),
    _prepareData: jest.fn().mockReturnThis(),
  })),
}));

jest.mock("../../libs/notification-close", () => jest.fn());

describe("init", () => {
  let mockHolderElements;

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-js="active-devices-trend" data-svg="chart0"></div>
      <div data-js="active-devices-trend" data-svg="chart1"></div>
      <div data-js="active-devices-trend" data-svg="chart2"></div>
      <div data-js="active-devices-trend" data-svg="chart3"></div>
      <svg data-svg="chart0"></svg>
      <svg data-svg="chart1"></svg>
      <svg data-svg="chart2"></svg>
      <svg data-svg="chart3"></svg>
    `;

    mockHolderElements = document.querySelectorAll(
      '[data-js="active-devices-trend"]'
    );

    WeeklyActiveDevicesTrend.mockClear();
    initCloseButton.mockClear();
  });

  test("should throw an error if no elements with the specified selector exist", () => {
    document.body.innerHTML = "";

    try {
      init();
    } catch (error) {
      expect(error.message).toBe(
        "There are no elements containing [data-js='active-devices-trend'] attribute."
      );
    }
  });

  test("should initialise WeeklyActiveDevicesTrend instances for each holder element", () => {
    init();

    expect(mockHolderElements.length).toBe(4);

    mockHolderElements.forEach((holderEl, i) => {
      expect(WeeklyActiveDevicesTrend).toHaveBeenNthCalledWith(
        i + 1,
        holderEl,
        `[data-svg='chart${i}']`,
        expect.objectContaining({
          series: expect.any(Array),
          buckets: expect.any(Array),
        })
      );
    });

    expect(WeeklyActiveDevicesTrend).toHaveBeenCalledTimes(4);
  });

  test("should initialise close button functionality", () => {
    init();

    expect(initCloseButton).toHaveBeenCalled();
  });
});
