import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import Packages from "../Packages";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Packages />
    </QueryClientProvider>
  );
}

export default App;
