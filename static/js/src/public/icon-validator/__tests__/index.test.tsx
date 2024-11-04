import React from "react";
import ReactDOM from "react-dom/client";
import { cleanup, screen, waitFor } from "@testing-library/react";
import App from "../index";
import "@testing-library/jest-dom";

const renderApp = () => {
  const container = document.createElement("div");
  container.id = "main-content";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<App />);

  return root;
};

describe("App component", () => {
  let root: ReactDOM.Root;

  beforeEach(async () => {
    await waitFor(() => {
      root = renderApp();
    });
  });

  afterEach(async () => {
    await waitFor(() => {
      root.unmount();
      cleanup();
      document.body.innerHTML = "";
    });
  });

  test("renders the app with initial state", async () => {
    await waitFor(() => {
      expect(screen.getByText("Charm Icon Validator")).toBeInTheDocument();
      expect(screen.getByText(/Checks are based on the/i)).toBeInTheDocument();
      expect(screen.getByText("Charm Icon Specification")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Drag and drop, or use the file picker to choose your icon."
        )
      ).toBeInTheDocument();
    });
  });

  test("renders file input", async () => {
    await waitFor(() => {
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });

    const fileInput = screen
      .getByRole("presentation")
      .querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
  });
});
