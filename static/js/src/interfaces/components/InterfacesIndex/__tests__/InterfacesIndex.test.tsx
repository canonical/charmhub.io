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
      version: "1.0",
      lib: "",
      lib_url: "",
      docs_url:
        "https://documentation.ubuntu.com/charmlibs/reference/interfaces/interface1/",
      summary: "",
      description: "Description 1",
      status: "test",
    },
    {
      name: "interface2",
      version: "1.1",
      lib: "",
      lib_url: "",
      docs_url:
        "https://documentation.ubuntu.com/charmlibs/reference/interfaces/interface2/",
      summary: "",
      description: "Description 2",
      status: "beta",
    },
    {
      name: "interface3",
      version: "1.2",
      lib: "",
      lib_url: "",
      docs_url:
        "https://documentation.ubuntu.com/charmlibs/reference/interfaces/interface3/",
      summary: "",
      description: "Description 3",
      status: "beta",
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
