import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import InterfacesIndex from "../InterfacesIndex";
import InterfaceDetails from "../InterfaceDetails";

function App() {
  const initialProps = window.initialProps;

  return (
    <Router>
      <Routes>
        <Route
          path="/integrations"
          element={<InterfacesIndex {...initialProps} />}
        />
        <Route
          path="/integrations/:interfaceName"
          element={<InterfaceDetails {...initialProps} />}
        />
        <Route
          path="/integrations/:interfaceName/:interfaceStatus"
          element={<InterfaceDetails {...initialProps} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
