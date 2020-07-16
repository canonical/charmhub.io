import { utcParse } from "d3-time-format";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";

function prepareLineData() {
  const _data = [];
  const _keys = [];
  const data = [];

  this.rawData.series.forEach((series) => {
    _keys.push(series.name);
    const obj = {
      name: series.name,
      values: [],
    };
    series.values.forEach((value, index) => {
      obj.values.push({
        date: utcParse("%Y-%m-%d")(this.rawData.buckets[index]),
        value: value,
      });
    });
    data.push(obj);
  });

  this.rawData.buckets.forEach((bucket, i) => {
    const obj = {
      date: utcParse("%Y-%m-%d")(bucket),
    };

    data.forEach((series) => {
      obj[series.name] = series.values[i].value;
    });

    _data.push(obj);
  });

  const values = this.rawData.series.reduce((acc, current) => {
    return acc.concat(current.values);
  }, []);

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

function prepareScales() {
  this.xScale = scaleTime()
    .rangeRound([0, this.width])
    .domain(extent(this.data, (d) => d.date));
  this.yScale = scaleLinear()
    .rangeRound([this.height, 0])
    .nice()
    .domain([0, this.maxYValue + Math.ceil(this.maxYValue * 0.1)]);
}

export { prepareLineData, prepareScales };
