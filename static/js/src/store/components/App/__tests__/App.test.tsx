import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom";

jest.mock("../../Packages", () => () => <div>Packages Component</div>);

describe("App Component", () => {
  test("should render the App component with the Packages route", () => {
    render(<App />);

    expect(screen.getByText("Packages Component")).toBeInTheDocument();
  });
});
