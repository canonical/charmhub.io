import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { RecoilRoot } from "recoil";

import Collaborators from "./Collaborators";
import InviteConfirmation from "./InviteConfirmation";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });

  return (
    <RecoilRoot>
      <Router>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route
              path="/:packageName/collaboration"
              element={<Collaborators />}
            />
            <Route
              path="/:packageName/collaboration/confirm"
              element={<InviteConfirmation />}
            />
          </Routes>
        </QueryClientProvider>
      </Router>
    </RecoilRoot>
  );
}

export default App;
