function renderLines() {
  let pathsLayer = this.g.selectAll(".layer.data-layer");

  if (pathsLayer.size() === 0) {
    pathsLayer = this.g.append("g").attr("class", "layer data-layer");
  }

  const paths = pathsLayer.selectAll(".path").data(this.transformedData);

  paths.exit().remove();

  paths
    .enter()
    .append("path")
    .attr("class", "path")
    .attr("pointer-events", "none")
    .attr("data-name", (d) => d.name)
    .style("stroke", this.lineColor)
    .style("fill", "none")
    .merge(paths)
    .attr("d", (d) => this.lines(d.values));
}

export { renderLines };
