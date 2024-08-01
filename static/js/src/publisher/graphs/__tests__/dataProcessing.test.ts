import { prepareLineData, prepareScales } from "../dataProcessing";
import { WeeklyActiveDevicesTrend } from "../activeDevices";
import { scaleLinear, scaleTime } from "d3-scale";

jest.mock("d3-time-format", () => ({
  utcParse: jest
    .fn()
    .mockImplementation(() => (dateString: string) => new Date(dateString)),
}));

jest.mock("d3-scale", () => ({
  scaleLinear: jest.fn().mockReturnValue({
    rangeRound: jest.fn().mockReturnThis(),
    nice: jest.fn().mockReturnThis(),
    domain: jest.fn().mockReturnThis(),
  }),
  scaleTime: jest.fn().mockReturnValue({
    rangeRound: jest.fn().mockReturnThis(),
    domain: jest.fn().mockReturnThis(),
  }),
}));

jest.mock("d3-array", () => ({
  extent: jest
    .fn()
    .mockReturnValue([new Date("2024-01-01"), new Date("2024-01-07")]),
}));

const mockSVG = {
  attr: jest.fn().mockReturnValue(300), // Mock height value
  append: jest.fn().mockReturnThis(),
};

jest.mock("../activeDevices", () => {
  return {
    WeeklyActiveDevicesTrend: jest
      .fn()
      .mockImplementation((holderEl, holderSvgSelector, rawData) => {
        return {
          holderEl,
          holderSvgSelector,
          rawData,
          svg: mockSVG,
          width: 500,
          height: 300,
          colorPositive: "green",
          colorNegative: "red",
          maxYValue: 0,
          lineColor: "",
          data: [],
          keys: [],
          transformedData: [],
          xScale: null,
          yScale: null,
          _prepareSVG: jest.fn(),
        };
      }),
  };
});

describe("WeeklyActiveDevicesTrend", () => {
  let trend: WeeklyActiveDevicesTrend;

  beforeEach(() => {
    const holderEl = {};
    const holderSvgSelector = "#svg";
    const rawData = {
      buckets: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
        "2024-01-06",
        "2024-01-07",
      ],
      series: [
        { name: "Device1", values: [10, 20, 15, 25, 30, 28, 35] },
        { name: "Device2", values: [5, 15, 20, 15, 10, 25, 30] },
      ],
    };

    trend = new WeeklyActiveDevicesTrend(holderEl, holderSvgSelector, rawData);
  });

  describe("prepareLineData", () => {
    test("should transform data correctly and set the line colour based on values", () => {
      prepareLineData.call(trend);

      expect(trend.data).toEqual([
        { date: new Date("2024-01-01"), Device1: 10, Device2: 5 },
        { date: new Date("2024-01-02"), Device1: 20, Device2: 15 },
        { date: new Date("2024-01-03"), Device1: 15, Device2: 20 },
        { date: new Date("2024-01-04"), Device1: 25, Device2: 15 },
        { date: new Date("2024-01-05"), Device1: 30, Device2: 10 },
        { date: new Date("2024-01-06"), Device1: 28, Device2: 25 },
        { date: new Date("2024-01-07"), Device1: 35, Device2: 30 },
      ]);

      expect(trend.keys).toEqual(["Device1", "Device2"]);
      expect(trend.maxYValue).toBe(35);
      expect(trend.lineColor).toBe("green");
      expect(trend.transformedData).toEqual([
        {
          name: "Device1",
          values: [
            { date: new Date("2024-01-01"), value: 10 },
            { date: new Date("2024-01-02"), value: 20 },
            { date: new Date("2024-01-03"), value: 15 },
            { date: new Date("2024-01-04"), value: 25 },
            { date: new Date("2024-01-05"), value: 30 },
            { date: new Date("2024-01-06"), value: 28 },
            { date: new Date("2024-01-07"), value: 35 },
          ],
        },
        {
          name: "Device2",
          values: [
            { date: new Date("2024-01-01"), value: 5 },
            { date: new Date("2024-01-02"), value: 15 },
            { date: new Date("2024-01-03"), value: 20 },
            { date: new Date("2024-01-04"), value: 15 },
            { date: new Date("2024-01-05"), value: 10 },
            { date: new Date("2024-01-06"), value: 25 },
            { date: new Date("2024-01-07"), value: 30 },
          ],
        },
      ]);
    });
  });

  describe("prepareScales", () => {
    test("should configure scales correctly", () => {
      trend.data = [
        { date: new Date("2024-01-01"), Device1: "10", Device2: "5" },
        { date: new Date("2024-01-07"), Device1: "35", Device2: "30" },
      ];
      trend.maxYValue = 35;

      prepareScales.call(trend);

      expect(scaleTime().rangeRound).toHaveBeenCalledWith([0, 500]);
      expect(scaleTime().domain).toHaveBeenCalledWith([
        new Date("2024-01-01"),
        new Date("2024-01-07"),
      ]);

      expect(scaleLinear().rangeRound).toHaveBeenCalledWith([300, 0]);
      expect(scaleLinear().domain).toHaveBeenCalledWith([0, 39]);
    });
  });
});
