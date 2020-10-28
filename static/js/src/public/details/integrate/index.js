import { select } from "d3-selection";
import Swiper, { Navigation, Pagination } from "swiper";
import "swiper/swiper-bundle.css";

function buildChart(data) {
  // set dimensions
  const chartWidth = window.innerWidth * 0.8;
  const chartHeight = 280;
  const iconWidth = 70;
  const iconHeight = 70;
  const iconContainerRadius = 60;
  const iconRadius = 35;
  const nodeRadius = 6;
  const nodeWidth = nodeRadius * 2;

  // define chart wrapper
  const wrapper = select("#integration-chart-wrapper");
  const svg = wrapper.append("svg");

  svg
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "integration-chart")
    .attr("style", "display: block; margin: 0 auto");

  // setup icon images
  const defs = svg.append("defs");

  defs
    .append("pattern")
    .attr("id", "imageOne")
    .attr("width", 1)
    .attr("height", 1)
    .append("svg:image")
    .attr("xlink:href", data.packageOne.iconPath)
    .attr("width", iconWidth)
    .attr("height", iconHeight);

  defs
    .append("pattern")
    .attr("id", "imageTwo")
    .attr("width", 1)
    .attr("height", 1)
    .append("svg:image")
    .attr("xlink:href", data.packageTwo.iconPath)
    .attr("width", iconWidth)
    .attr("height", iconHeight);

  // define chart bounds
  const bounds = svg.append("g");
  bounds.attr("width", chartWidth).attr("height", chartHeight);

  // left icon circle
  bounds
    .append("circle")
    .attr("cx", iconContainerRadius)
    .attr("cy", chartHeight / 2)
    .attr("r", iconContainerRadius)
    .attr("fill", "#f7f7f7")
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", 1);

  bounds
    .append("circle")
    .attr("cx", iconContainerRadius)
    .attr("cy", chartHeight / 2)
    .attr("r", iconRadius)
    .attr("fill", "url(#imageOne)")
    .attr("stroke", "#e5e5e5")
    .attr("stroke-width", 1);

  // left icon circle nodes
  const leftOriginX = iconContainerRadius + nodeRadius;
  const leftOriginY = chartHeight / 2 + nodeRadius;

  const leftNodeOriginX = leftOriginX + iconContainerRadius * Math.sin(0);
  const leftNodeOriginY = leftOriginY - iconContainerRadius * Math.cos(0);

  bounds
    .selectAll(".left-node")
    .data(data.groups)
    .enter()
    .append("circle")
    .attr("class", "left-node")
    .attr("cx", leftNodeOriginX - nodeWidth / 2)
    .attr("cy", leftNodeOriginY - nodeWidth / 2)
    .attr("r", nodeRadius)
    .attr("width", nodeWidth)
    .attr("height", nodeWidth)
    .attr("fill", "#cdcdcd")
    .attr("transform", (d, i) => {
      const angle = 102 - nodeWidth * data.groups.length;

      return `rotate(${angle + i * nodeRadius * 4}, ${
        leftOriginX - nodeRadius
      }, ${leftOriginY - nodeRadius})`;
    });

  // left node lines
  bounds
    .selectAll(".left-node-line")
    .data(data.groups)
    .enter()
    .append("path")
    .attr("class", "left-node-line")
    .attr("d", (d, i) => {
      let leftNodeYEndPos = chartHeight / 2;

      if (data.groups.length === 5) {
        if (i === 0) {
          leftNodeYEndPos = chartHeight / 2 + 25;
        }

        if (i === 4) {
          leftNodeYEndPos = chartHeight / 2 - 24;
        }
      }

      return `M ${iconContainerRadius * 2} ${chartHeight / 2} L ${
        iconContainerRadius * 4
      } ${leftNodeYEndPos}`;
    })
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", "1")
    .attr("transform", (d, i) => {
      const angle = 12 - nodeWidth * data.groups.length;

      return `rotate(${angle + i * nodeRadius * 4}, ${
        leftOriginX - nodeRadius
      }, ${leftOriginY - nodeRadius})`;
    });

  // right icon circle
  bounds
    .append("circle")
    .attr("cx", chartWidth - iconContainerRadius)
    .attr("cy", chartHeight / 2)
    .attr("r", iconContainerRadius)
    .attr("fill", "#f7f7f7")
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", 1);

  bounds
    .append("circle")
    .attr("cx", chartWidth - iconContainerRadius)
    .attr("cy", chartHeight / 2)
    .attr("r", iconRadius)
    .attr("fill", "url(#imageTwo)")
    .attr("stroke", "#e5e5e5")
    .attr("stroke-width", 1);

  // right icon circle nodes
  const rightOriginX =
    iconContainerRadius + nodeRadius + chartWidth - iconContainerRadius * 2;
  const rightOriginY = chartHeight / 2 + nodeRadius;

  const rightNodeOriginX = rightOriginX + iconContainerRadius * Math.sin(0);
  const rightNodeOriginY = rightOriginY - iconContainerRadius * Math.cos(0);

  bounds
    .selectAll(".right-node")
    .data(data.groups)
    .enter()
    .append("circle")
    .attr("class", "right-node")
    .attr("cx", rightNodeOriginX - nodeWidth / 2)
    .attr("cy", rightNodeOriginY - nodeWidth / 2)
    .attr("r", nodeRadius)
    .attr("width", nodeWidth)
    .attr("height", nodeWidth)
    .attr("fill", "#cdcdcd")
    .attr("transform", (d, i) => {
      const angle = 102 - nodeWidth * data.groups.length;

      return `rotate(-${angle + i * nodeRadius * 4}, ${
        rightOriginX - nodeRadius
      }, ${rightOriginY - nodeRadius})`;
    });

  // right node lines
  bounds
    .selectAll(".right-node-line")
    .data(data.groups)
    .enter()
    .append("path")
    .attr("class", "right-node-line")
    .attr("d", (d, i) => {
      let rightNodeYEndPos = chartHeight / 2;

      if (data.groups.length === 5) {
        if (i === 0) {
          rightNodeYEndPos = chartHeight / 2 - 25;
        }

        if (i === 4) {
          rightNodeYEndPos = chartHeight / 2 + 24;
        }
      }

      return `M ${chartWidth - iconContainerRadius * 2} ${chartHeight / 2} L ${
        chartWidth - iconContainerRadius * 4
      } ${rightNodeYEndPos}`;
    })
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", 1)
    .attr("transform", (d, i) => {
      const angle = 12 - nodeWidth * data.groups.length;

      return `rotate(${angle + i * nodeRadius * 4}, ${
        rightOriginX - nodeRadius
      }, ${rightOriginY - nodeRadius})`;
    });

  // center block of the chart
  bounds
    .append("rect")
    .attr("width", chartWidth - iconContainerRadius * 5)
    .attr("height", chartHeight)
    .attr("x", iconContainerRadius * 2.5)
    .attr("y", 0)
    .attr("fill", "#ffffff");

  // connecting lines
  const connectingLinesGroup = bounds
    .append("g")
    .attr("width", chartWidth - iconContainerRadius * 5)
    .attr("height", 40 * data.groups.length)
    .attr("x", iconContainerRadius * 2.5)
    .attr("y", 0)
    .attr("transform", `translate(0, -${(40 * data.groups.length) / 2 - 20})`);

  connectingLinesGroup
    .selectAll(".connecting-line")
    .data(data.groups)
    .enter()
    .append("path")
    .attr("class", "connecting-line")
    .attr(
      "d",
      `M ${iconContainerRadius * 2 + 30} ${chartHeight / 2} L ${
        chartWidth - iconContainerRadius * 2 - 30
      } ${chartHeight / 2}`
    )
    .attr("stroke", "#cdcdcd")
    .attr("stroke-width", "1")
    .attr("transform", (d, i) => {
      return `translate(0, ${40 * i})`;
    });

  // connecting lines headings
  const headingsGroup = bounds
    .append("g")
    .attr("transform", `translate(0, -${21 * data.groups.length})`);

  headingsGroup
    .append("text")
    .attr("x", iconContainerRadius * 2.5)
    .attr("y", chartHeight / 2)
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "#666666")
    .text("Endpoint");

  headingsGroup
    .append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight / 2)
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "#666666")
    .attr("text-anchor", "middle")
    .text("Interface");

  headingsGroup
    .append("text")
    .attr("x", chartWidth - iconContainerRadius * 2.5)
    .attr("y", chartHeight / 2)
    .attr("font-family", "sans-serif")
    .attr("font-size", "14px")
    .attr("fill", "#666666")
    .attr("text-anchor", "end")
    .text("Endpoint");

  // connecting lines text
  data.groups.forEach((group, i) => {
    const textGroup = bounds
      .append("g")
      .attr(
        "transform",
        `translate(0, -${(40 * data.groups.length) / 2 - 21})`
      );

    // each text is duplicated with the underlayer
    // having a white stroke so the line underneath
    // doesn't show through

    // left text
    textGroup
      .append("text")
      .attr("x", iconContainerRadius * 2.5)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#ffffff")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 10)
      .text(data.groups[i][0])
      .attr("transform", `translate(0, ${40 * i})`);

    textGroup
      .append("text")
      .attr("x", iconContainerRadius * 2.5)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#111111")
      .text(data.groups[i][0])
      .attr("transform", `translate(0, ${40 * i})`);

    // middle text
    textGroup
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#ffffff")
      .attr("text-anchor", "middle")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 10)
      .text(data.groups[i][1])
      .attr("transform", `translate(0, ${40 * i})`);

    textGroup
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#111111")
      .attr("text-anchor", "middle")
      .text(data.groups[i][1])
      .attr("transform", `translate(0, ${40 * i})`);

    // right text
    textGroup
      .append("text")
      .attr("x", chartWidth - iconContainerRadius * 2.5)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#ffffff")
      .attr("text-anchor", "end")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 10)
      .text(data.groups[i][2])
      .attr("transform", `translate(0, ${40 * i})`);

    textGroup
      .append("text")
      .attr("x", chartWidth - iconContainerRadius * 2.5)
      .attr("y", chartHeight / 2 + 4)
      .attr("font-family", "sans-serif")
      .attr("font-size", "16px")
      .attr("fill", "#111111")
      .attr("text-anchor", "end")
      .text(data.groups[i][2])
      .attr("transform", `translate(0, ${40 * i})`);
  });
}

const init = (packageName, integrationPackage) => {
  Swiper.use([Navigation, Pagination]);

  const swiper = new Swiper(".swiper-container", {
    pagination: {
      el: ".swiper-pagination",
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  document.getElementById("integration-chart-wrapper").innerHTML = "";

  // TOTO: THIS IS THE DATA!!!!!!
  const data = {
    groups: [["websso-trusted-dashboard", "identity-service", "keystone"]],
    packageOne: {
      name: "openstack-dashboard",
      iconPath: `https://api.jujucharms.com/charmstore/v5/${packageName}/icon.svg`,
    },
    packageTwo: {
      name: "keystone",
      iconPath: `https://api.jujucharms.com/charmstore/v5/${integrationPackage}/icon.svg`,
    },
  };

  const groups1 = [
    ["websso-trusted-dashboard", "identity-service", "keystone"],
  ];

  const groups2 = [
    ["website", "http", "website"],
    ["api", "mysql", "db"],
  ];

  const groups3 = [
    ["websso-trusted-dashboard", "identity-service", "keystone"],
    ["website", "http", "website"],
    ["api", "mysql", "db"],
  ];

  const groups4 = [
    ["websso-trusted-dashboard", "identity-service", "keystone"],
    ["website", "http", "website"],
    ["api", "mysql", "db"],
    ["dashboard", "server", "dashboard"],
  ];

  const groups5 = [
    ["websso-trusted-dashboard", "identity-service", "keystone"],
    ["website", "http", "website"],
    ["api", "mysql", "db"],
    ["dashboard", "server", "dashboard"],
    ["api", "mysql", "db"],
  ];

  if (window.location.pathname.includes("activemq")) {
    data.groups = groups1;
  }

  if (window.location.pathname.includes("advanced-routing")) {
    data.groups = groups2;
  }

  if (window.location.pathname.includes("ambassador")) {
    data.groups = groups3;
  }

  if (window.location.pathname.includes("aodh")) {
    data.groups = groups4;
  }

  if (window.location.pathname.includes("apache-flume-hdfs")) {
    data.groups = groups5;
  }

  buildChart(data);
};

export { init };
