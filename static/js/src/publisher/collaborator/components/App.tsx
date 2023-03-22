import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Collaborators from "./Collaborators";
import InviteConfirmation from "./InviteConfirmation";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/:package_name/collaboration"
          element={<Collaborators />}
        />
        <Route
          path="/:package_name/collaboration/confirm"
          element={<InviteConfirmation />}
        />
      </Routes>
    </Router>
  );
}

export default App;
