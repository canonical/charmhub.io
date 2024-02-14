import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";

import Collaborators from "./Collaborators";

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
          </Routes>
        </QueryClientProvider>
      </Router>
    </RecoilRoot>
  );
}

export default App;
