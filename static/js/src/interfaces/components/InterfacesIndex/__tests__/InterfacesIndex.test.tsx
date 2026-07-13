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
      status: "published",
      tags: ["tag1"],
      links: {
        library: "https://example.com/library",
        documentation: "https://example.com/docs",
      },
    },
    {
      name: "interface2",
      description: "Description 2",
      version: "1.1",
      status: "draft",
      tags: ["tag2", "tag3"],
    },
    {
      name: "interface3",
      description: "Description 3",
      version: "1.2",
      status: "deprecated",
      tags: ["tag1", "tag2"],
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

  test("filters interfaces by search query", async () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText("Search interfaces"), {
      target: { value: "interface2" },
    });

    await waitFor(() => {
      expect(screen.getByText("interface2")).toBeInTheDocument();
      expect(screen.queryByText("interface1")).not.toBeInTheDocument();
      expect(screen.queryByText("interface3")).not.toBeInTheDocument();
    });
  });

  test("filters interfaces by status", async () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText("Status"), {
      target: { value: "draft" },
    });

    await waitFor(() => {
      expect(screen.getByText("interface2")).toBeInTheDocument();
      expect(screen.queryByText("interface1")).not.toBeInTheDocument();
      expect(screen.queryByText("interface3")).not.toBeInTheDocument();
    });
  });

  test("filters interfaces by category", async () => {
    render(
      <Router>
        <InterfacesIndex interfacesList={interfacesList} />
      </Router>
    );

    fireEvent.change(screen.getByLabelText("Categories"), {
      target: { value: "tag3" },
    });

    await waitFor(() => {
      expect(screen.getByText("interface2")).toBeInTheDocument();
      expect(screen.queryByText("interface1")).not.toBeInTheDocument();
      expect(screen.queryByText("interface3")).not.toBeInTheDocument();
    });
  });
});
