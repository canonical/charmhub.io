import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InterfaceDetailsNav from "../InterfaceDetailsNav";

describe("InterfaceDetailsNav", () => {
  test("renders Charms link", () => {
    render(<InterfaceDetailsNav hasDeveloperDocumentation={false} />);

    const charmsLink = screen.getByText("Charms");
    expect(charmsLink).toBeInTheDocument();
    expect(charmsLink).toHaveAttribute("href", "#charms");
  });

  test("renders Developer documentation link when hasDeveloperDocumentation is true", () => {
    render(<InterfaceDetailsNav hasDeveloperDocumentation={true} />);

    const devDocLink = screen.getByText("Developer documentation");
    expect(devDocLink).toBeInTheDocument();
    expect(devDocLink).toHaveAttribute("href", "#developer-documentation");
  });

  test("does not render Developer documentation link when hasDeveloperDocumentation is false", () => {
    render(<InterfaceDetailsNav hasDeveloperDocumentation={false} />);

    const devDocLink = screen.queryByText("Developer documentation");
    expect(devDocLink).not.toBeInTheDocument();
  });
});
