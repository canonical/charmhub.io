import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeveloperDocumentation from "../DeveloperDocumentation";
import { InterfaceData } from "../../../types";

jest.mock("../../DocumentationSection/DocumentationSection", () => ({
  __esModule: true,
  default: jest.fn(() => <div>DocumentationSection</div>),
}));

const mockInterfaceData: InterfaceData = {
  name: "Sample Interface",
  version: "1.0",
  last_modified: "2024-07-19T00:00:00Z",
  body: [
    {
      heading: "Section 1",
      level: 1,
      children: [],
    },
    {
      heading: "Section 2",
      level: 2,
      children: [
        {
          heading: "SubSection 2.1",
          level: 3,
          children: [],
        },
        {
          heading: "SubSection 2.2",
          level: 3,
          children: [
            {
              heading: "SubSubSection 2.2.1",
              level: 4,
              children: [],
            },
          ],
        },
      ],
    },
  ],
};

const renderComponent = (interfaceData = mockInterfaceData) => {
  render(<DeveloperDocumentation interfaceData={interfaceData} />);
};

describe("DeveloperDocumentation", () => {
  test("renders heading", () => {
    renderComponent();
    expect(screen.getByText("Developer documentation")).toBeInTheDocument();
  });

  test("renders DocumentationSection for each item in body", () => {
    renderComponent();
    const documentationSections = screen.getAllByText("DocumentationSection");
    expect(documentationSections).toHaveLength(mockInterfaceData.body.length);
  });

  test("renders correct number of Strip components", () => {
    renderComponent();
    const strips = document.querySelectorAll(".p-strip");
    expect(strips.length).toBe(mockInterfaceData.body.length + 1);
  });

  test("renders last Strip without border", () => {
    renderComponent();
    const strips = document.querySelectorAll(".p-strip");
    const lastStrip = strips[strips.length - 1];
    expect(lastStrip).not.toHaveClass("is-bordered");
  });
});
