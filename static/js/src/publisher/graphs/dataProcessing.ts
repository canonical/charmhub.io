import { utcParse } from "d3-time-format";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";
import { WeeklyActiveDevicesTrend } from "./activeDevices";

type Data = {
  date?: Date;
  name: string;
  values: { date: Date; value: number }[];
};

function prepareLineData(this: WeeklyActiveDevicesTrend) {
  const _data: { [key: string]: string | Date }[] = [];
  const _keys: string[] = [];
  const data: Data[] = [];

  this.rawData.series.forEach((series: { name: string; values: number[] }) => {
    _keys.push(series.name);
    const obj: Data = {
      name: series.name,
      values: [],
    };
    series.values.forEach((value, index) => {
      obj.values.push({
        date: utcParse("%Y-%m-%d")(this.rawData.buckets[index]) as Date,
        value: value,
      });
    });
    data.push(obj);
  });

  this.rawData.buckets.forEach((bucket: string, i: number) => {
    const obj: {
      [key: string]: string | Date;
    } = {
      date: utcParse("%Y-%m-%d")(bucket) as Date,
    };

    data.forEach((series) => {
      obj[series.name] = series.values[i].value as unknown as string;
    });

    _data.push(obj);
  });

  const values = this.rawData.series.reduce(
    (acc: number[], current: { values: number[] }) => {
      return acc.concat(current.values);
    },
    []
  );

  // set line colour to green if the number of active devices went up (day7 - day1 > 0)
  // and red if the number of active devices went down
  const dataValues = data[0].values;
  this.lineColor =
    dataValues[dataValues.length - 1].value - dataValues[0].value > 0
      ? this.colorPositive
      : this.colorNegative;

  this.data = _data;
  this.keys = _keys;
  this.maxYValue = Math.max(...values);
  this.transformedData = data;
}

function prepareScales(this: WeeklyActiveDevicesTrend) {
  this.xScale = scaleTime()
    .rangeRound([0, this.width])
    .domain(extent(this.data, (d) => new Date(d.date)) as [Date, Date]);
  this.yScale = scaleLinear()
    .rangeRound([this.height, 0])
    .nice()
    .domain([0, this.maxYValue + Math.ceil(this.maxYValue * 0.1)]);
}

export { prepareLineData, prepareScales };
