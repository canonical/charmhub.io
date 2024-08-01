import { select, selectAll } from "d3-selection";
import { WeeklyActiveDevicesTrend } from "../activeDevices";
import { prepareLineData, prepareScales } from "../dataProcessing";
import { renderLines } from "../rendering";

jest.mock("d3-selection", () => ({
  select: jest.fn().mockReturnValue({
    selectAll: jest.fn().mockReturnValue({
      remove: jest.fn(),
    }),
    append: jest.fn().mockReturnThis(),
    attr: jest.fn().mockReturnValue(400), // Mocked SVG height
  }),
  selectAll: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
}));

jest.mock("d3-shape", () => ({
  line: jest.fn().mockReturnValue({
    x: jest.fn().mockReturnThis(),
    y: jest.fn().mockReturnThis(),
  }),
}));

jest.mock("d3-format", () => ({
  format: jest.fn().mockReturnValue((value: number) => value.toString()),
}));

jest.mock("../dataProcessing", () => ({
  prepareLineData: jest.fn(),
  prepareScales: jest.fn(),
}));

jest.mock("../rendering", () => ({
  renderLines: jest.fn(),
}));

jest.mock("../../../libs/arrays", () => ({
  arraysMerge: jest
    .fn()
    .mockImplementation((arr1, arr2) => Array.from(new Set(arr1.concat(arr2)))),
}));

describe("WeeklyActiveDevicesTrend", () => {
  let holderEl: HTMLElement;
  let holderSvgSelector: string;
  let rawData: {
    buckets: string[];
    series: { name: string; values: number[] }[];
  };

  beforeEach(() => {
    holderEl = document.createElement("div");
    holderSvgSelector = ".test-svg";
    rawData = {
      buckets: ["2024-01-01"],
      series: [{ name: "Series1", values: [10] }],
    };
    (select as jest.Mock).mockReturnValue({
      selectAll: jest.fn().mockReturnValue({
        remove: jest.fn(),
      }),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnValue(400),
    });
  });

  test("constructor initializes properties correctly", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );

    expect(trend.holder).toBe(holderEl);
    expect(trend.rawData).toBe(rawData);
    expect(trend.hasRendered).toBe(false);
    expect(trend.colorPositive).toBe("#0E8420");
    expect(trend.colorNegative).toBe("#C7162B");
    expect(trend.lines).toBeDefined();
    expect(trend.shortValue).toBeInstanceOf(Function);
    expect(trend.width).toBe(holderEl.clientWidth);
    expect(trend.height).toBe(399); // 400 - 1
    expect(trend.g).toBeDefined();
    expect(prepareLineData).toHaveBeenCalled();
    expect(prepareScales).toHaveBeenCalled();
  });

  test("_prepareSVG removes existing elements and initializes SVG", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );
    trend._prepareSVG();

    expect(selectAll).toHaveBeenCalledWith("*");
    expect((select as jest.Mock).mock.calls[0][0]).toBe(
      `${holderSvgSelector} svg`
    );
  });

  test("_prepareData calls data preparation functions", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );
    trend._prepareData();

    expect(prepareLineData).toHaveBeenCalled();
    expect(prepareScales).toHaveBeenCalled();
  });

  test("updateData merges and updates rawData", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );
    const newData = {
      buckets: ["2024-01-02"],
      series: [{ name: "Series2", values: [20] }],
    };

    trend.updateData(newData);

    expect(trend.rawData.buckets).toEqual(["2024-01-02", "2024-01-01"]);
    expect(trend.rawData.series).toEqual([
      { name: "Series1", values: [10] },
      { name: "Series2", values: [20] },
    ]);
  });

  test("render calls renderLines and sets hasRendered to true", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );
    trend.render();

    expect(renderLines).toHaveBeenCalled();
    expect(trend.hasRendered).toBe(true);
  });

  test("show sets holder opacity to 1", () => {
    const trend = new WeeklyActiveDevicesTrend(
      holderEl,
      holderSvgSelector,
      rawData
    );
    trend.show();

    expect((holderEl as HTMLElement).style.opacity).toBe("1");
  });
});
