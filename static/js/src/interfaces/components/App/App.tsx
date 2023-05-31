import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import InterfacesIndex from "../InterfacesIndex";
import InterfaceDetails from "../InterfaceDetails";

function App() {
  const initialProps = window.initialProps;

  return (
    <Router>
      <Routes>
        <Route
          path="/interfaces"
          element={<InterfacesIndex {...initialProps} />}
        />
        <Route
          path="/interfaces/:interfaceName"
          element={<InterfaceDetails {...initialProps} />}
        />
        <Route
          path="/interfaces/:interfaceName/:interfaceStatus"
          element={<InterfaceDetails {...initialProps} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
