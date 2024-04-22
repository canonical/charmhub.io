import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/:packageName",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/:packageName/foo",
        element: <h1>Hello</h1>,
      },
    ],
  },
]);

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<RouterProvider router={router} />);
