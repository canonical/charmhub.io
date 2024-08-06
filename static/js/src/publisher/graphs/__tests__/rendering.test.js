import { renderLines } from "../rendering";
import * as d3 from "d3";
import "@testing-library/jest-dom";

describe("renderLines function", () => {
  let svg, g, instance;

  beforeEach(() => {
    svg = d3
      .select("body")
      .append("svg")
      .attr("width", 500)
      .attr("height", 500);
    g = svg.append("g");

    instance = {
      g: g,
      transformedData: [
        { name: "Line 1", values: [] },
        { name: "Line 2", values: [] },
      ],
      lineColor: "red",
      lines: jest.fn(() => "mock-path-d-attribute"),
    };
  });

  afterEach(() => {
    svg.remove();
  });

  test("should append a new data-layer group if not present", () => {
    expect(g.selectAll(".layer.data-layer").size()).toBe(0);

    renderLines.call(instance);

    expect(g.selectAll(".layer.data-layer").size()).toBe(1);
  });

  test("should correctly append paths with data", () => {
    renderLines.call(instance);

    const paths = g.selectAll(".layer.data-layer .path");

    expect(paths.size()).toBe(instance.transformedData.length);

    paths.each(function (d, i) {
      const path = d3.select(this);
      expect(path.attr("data-name")).toBe(instance.transformedData[i].name);
      expect(path.style("stroke")).toBe(instance.lineColor);
      expect(path.style("fill")).toBe("none");
      expect(path.attr("pointer-events")).toBe("none");
      expect(path.attr("d")).toBe("mock-path-d-attribute");
    });
  });

  test("should remove exiting paths", () => {
    renderLines.call(instance);

    instance.transformedData.pop();
    renderLines.call(instance);

    const paths = g.selectAll(".layer.data-layer .path");

    expect(paths.size()).toBe(1);
    expect(paths.attr("data-name")).toBe("Line 1");
  });

  test("should handle empty data", () => {
    instance.transformedData = [];

    renderLines.call(instance);

    const paths = g.selectAll(".layer.data-layer .path");
    expect(paths.size()).toBe(0);
  });

  test("should not append multiple data-layer groups", () => {
    renderLines.call(instance);
    renderLines.call(instance);

    const layers = g.selectAll(".layer.data-layer");
    expect(layers.size()).toBe(1);
  });
});
