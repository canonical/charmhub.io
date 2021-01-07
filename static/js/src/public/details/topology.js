class Topology {
  constructor(topologyData) {
    if (topologyData) {
      console.log(topologyData);
    } else {
      throw new Error(`Plese provide topology data in JSON format.`);
    }
  }
}

export { Topology };
