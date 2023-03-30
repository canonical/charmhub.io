import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import InterfacesIndex from "../InterfacesIndex";
import InterfaceDetails from "../InterfaceDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/interfaces" element={<InterfacesIndex />} />
        <Route
          path="/interfaces/:interfaceName"
          element={<InterfaceDetails />}
        />
        <Route
          path="/interfaces/:interfaceName/:interfaceStatus"
          element={<InterfaceDetails />}
        />
      </Routes>
    </Router>
  );
}

export default App;
