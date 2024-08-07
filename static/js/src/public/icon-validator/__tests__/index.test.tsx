import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../index";
import "@testing-library/jest-dom";

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  render: jest.fn(),
}));

describe("App component", () => {
  beforeEach(() => {
    render(<App />);
  });

  test("renders the app with initial state", () => {
    expect(screen.getByText("Charm Icon Validator")).toBeInTheDocument();
    expect(screen.queryByText(/Checks are based on the/i)).toBeInTheDocument();
    expect(screen.getByText("Charm Icon Specification")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Drag and drop, or use the file picker to choose your icon."
      )
    ).toBeInTheDocument();
  });

  test("displays the notification based on the validity of the icon", async () => {
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

    setTimeout(() => {
      expect(screen.findByText("Valid icon uploaded")).toBeInTheDocument();
    }, 0);
  });

  test("validates the icon's size and shows error if incorrect", async () => {
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

    setTimeout(() => {
      expect(screen.findByText("Icon size is invalid")).toBeInTheDocument();
    }, 0);
  });

  test("renders the Charmhub.io preview when the icon is valid", async () => {
    const fileInput = screen
      .getByRole("presentation")
      .querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(
      [
        `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
               <rect width="100" height="100" fill="green" />
             </svg>`,
      ],
      "valid-icon.svg",
      { type: "image/svg+xml" }
    );

    fireEvent.change(fileInput, { target: { files: [file] } });

    setTimeout(() => {
      expect(screen.findByText("Charmhub.io preview")).toBeInTheDocument();
    }, 0);
  });
});
