import { select } from "d3-selection";
import { format } from "d3-format";
import { line } from "d3-shape";
import debounce from "../../libs/debounce";
import { arraysMerge } from "../../libs/arrays";

import { prepareLineData, prepareScales } from "./dataProcessing";
import { renderLines } from "./rendering";

class WeeklyActiveDevicesTrend {
  /**
   *
   * @param {object} holderEl the element containing the graph
   * @param {string} holderSvgSelector CSS selector for the element containing the graph
   * @param {object} rawData
   * @param {string[]} rawdata.buckets The list of dates in the format YYYY-MM-DD
   * @param {{name: string, values: number[]}[]} rawData.series The different series to show on the graph
   */
  constructor(holderEl, holderSvgSelector, rawData) {
    this.holder = holderEl;
    this.rawData = rawData;

    this.margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    this.padding = {
      top: 0,
      right: 0,
      bottom: 1,
      left: 0,
    };

    this.width;
    this.height;

    this.svg = select(`${holderSvgSelector} svg`);
    this.g = undefined;

    this.transformedData = undefined;
    this.data = undefined;
    this.keys = undefined;
    this.maxYValue = undefined;

    this.xScale = undefined;
    this.yScale = undefined;
    this.lineColor = undefined;

    this.hasRendered = false;

    this.colorPositive = "#0E8420";
    this.colorNegative = "#C7162B";

    this.lines = line()
      .x((d) => this.xScale(d.date))
      .y((d) => this.yScale(d.value));

    this.shortValue = (number) =>
      number < 1000 ? number : format(".2s")(number);

    this._prepareSVG();

    if (Object.keys(this.rawData).length > 0) {
      this._prepareData();
    }

    const resize = debounce(() => {
      if (this.hasRendered) {
        this._prepareSVG()._prepareData().render();
      }
    }, 100);

    select(window).on("resize", resize);
  }

  _prepareSVG() {
    this.svg.selectAll("*").remove();

    this.width =
      this.holder.clientWidth -
      this.margin.left -
      this.margin.right -
      this.padding.left -
      this.padding.right;

    this.height =
      this.svg.attr("height") -
      this.margin.top -
      this.margin.bottom -
      this.padding.top -
      this.padding.bottom;

    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    return this;
  }

  _prepareData() {
    prepareLineData.call(this);

    prepareScales.call(this);

    return this;
  }

  /**
   *
   * @param {object} data
   * @param {string[]} data.buckets The list of dates in the format YYYY-MM-DD
   * @param {{name: string, values: number[]}[]} data.series The different series to show on the graph
   * @returns {WeeklyActiveDevicesTrend}
   */
  updateData(data) {
    if (!this.rawData.series) {
      this.rawData = data;
    } else {
      this.rawData.series = this.rawData.series.concat(data.series);
    }

    this.rawData.buckets = arraysMerge(data.buckets, this.rawData.buckets);

    this._prepareData();

    return this;
  }

  /**
   *
   * @returns {WeeklyActiveDevicesTrend}
   */
  render() {
    renderLines.call(this);

    this.hasRendered = true;

    return this;
  }

  /**
   *
   * @returns {WeeklyActiveDevicesTrend}
   */
  show() {
    this.holder.style.opacity = 1;

    return this;
  }
}

export { WeeklyActiveDevicesTrend };
