import React from "react";
import ReactDOM from "react-dom/client";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
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

  test("displays the notification based on the validity of the icon", async () => {
    await waitFor(() => {
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });

    const fileInput = screen
      .getByRole("presentation")
      .querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(
      [
        `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
               <rect width="100" height="100" fill="blue" />
             </svg>`,
      ],
      "icon.svg",
      { type: "image/svg+xml" }
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    setTimeout(async () => {
      expect(
        await screen.findByText("Valid icon uploaded")
      ).toBeInTheDocument();
      expect(await screen.getByText("Charmhub.io preview")).toBeInTheDocument();
    }, 1000);
  });

  test("validates the icon's size and shows error if incorrect", async () => {
    await waitFor(() => {
      expect(screen.getByRole("presentation")).toBeInTheDocument();
    });

    const fileInput = screen
      .getByRole("presentation")
      .querySelector('input[type="file"]') as HTMLInputElement;

    const invalidSizeFile = new File(
      [
        `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
               <rect width="150" height="150" fill="red" />
             </svg>`,
      ],
      "invalid-icon.svg",
      { type: "image/svg+xml" }
    );

    fireEvent.change(fileInput, { target: { files: [invalidSizeFile] } });

    setTimeout(async () => {
      expect(
        await screen.findByText("Icon size is invalid")
      ).toBeInTheDocument();
    }, 1000);
  });
});
