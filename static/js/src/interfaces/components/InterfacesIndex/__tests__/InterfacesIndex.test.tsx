import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import InterfacesIndex from "../InterfacesIndex";
import type { InterfaceItem } from "../../../types";

describe("InterfacesIndex", () => {
  const interfacesList: InterfaceItem[] = [
    {
      name: "interface1",
      description: "Description 1",
      version: "1.0",
      status: "test",
      category: "Category 1",
    },
    {
      name: "interface2",
      description: "Description 2",
      version: "1.1",
      status: "beta",
      category: "Category 2",
    },
    {
      name: "interface3",
      description: "Description 3",
      version: "1.2",
      status: "beta",
      category: "Category 3",
    },
  ];

  test("renders InterfacesIndex", () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );
    expect(screen.getByText("Interfaces")).toBeInTheDocument();
  });

  test("displays the correct interfaces", async () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText("interface1")).toBeInTheDocument();
      expect(screen.getByText("interface2")).toBeInTheDocument();
      expect(screen.getByText("interface3")).toBeInTheDocument();
    });
  });

  test("shows empty state", () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={[]} />
      </Router>
    );
    expect(screen.getByText("No interfaces available")).toBeInTheDocument();
  });

  test("updates document title on mount", () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    expect(document.title).toBe("Charmhub | Interface catalogue");
  });

  test("navigates to correct interface detail page", async () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    const interfaceLink = screen.getByText("interface1");
    fireEvent.click(interfaceLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/integrations/interface1");
    });
  });

  test("handles pagination correctly", async () => {
    const longerInterfacesList: InterfaceItem[] = Array(5)
      .fill(interfacesList)
      .flat();

    render(
      <Router>
        <InterfacesIndex interfacesList={longerInterfacesList} />
      </Router>
    );

    expect(screen.getByText("Next page")).toBeInTheDocument();
    expect(screen.getByText("Previous page")).toBeInTheDocument();
  });
});
