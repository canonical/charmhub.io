import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DocumentationSection from "../DocumentationSection";
import mermaid from "mermaid";

vi.mock("mermaid", async (importOriginal) => ({
  default: {
    ...(await importOriginal<typeof mermaid>()),
    initialize: vi.fn(),
  },
}));

vi.mock("../../MermaidDiagram", () => ({
  default: (props: { code: string }) => (
    <div data-testid="mermaid-diagram">{props.code}</div>
  ),
}));

beforeAll(() => {
  globalThis.crypto.randomUUID = vi.fn();
});

const mockSubSubSectionData = {
  heading: "SubSubSection Heading",
  level: 3,
  children: ["SubSubSection content 1.", "SubSubSection content 2."],
};

const mockSubSectionData = {
  heading: "SubSection Heading",
  level: 2,
  children: [mockSubSubSectionData, mockSubSubSectionData],
};

const mockSectionData = {
  heading: "Main Section Heading",
  level: 1,
  children: [mockSubSectionData],
};

describe("DocumentationSection", () => {
  test("renders the main heading", () => {
    render(<DocumentationSection interfaceData={mockSectionData} />);

    const mainHeading = screen.getByText("Main Section Heading");
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveClass("p-heading--4");
  });

  test("renders SubSection headings and content", () => {
    render(<DocumentationSection interfaceData={mockSectionData} />);

    const subSubSectionContent1 = screen.getAllByText(
      "SubSubSection content 1."
    );
    expect(subSubSectionContent1.length).toBe(2);
    subSubSectionContent1.forEach((section) =>
      expect(section).toBeInTheDocument()
    );

    const subSubSectionContent2 = screen.getAllByText(
      "SubSubSection content 2."
    );
    expect(subSubSectionContent2.length).toBe(2);
    subSubSectionContent2.forEach((section) =>
      expect(section).toBeInTheDocument()
    );
  });

  test("renders Mermaid diagrams", async () => {
    const mermaidContent = "A-->B";

    const mockMermaidSectionData = {
      heading: "Mermaid Section",
      level: 1,
      children: [
        {
          heading: "Mermaid Section Heading",
          level: 2,
          children: [
            {
              heading: "Mermaid SubSubSection Heading",
              level: 3,
              children: [mermaidContent],
            },
          ],
        },
      ],
    };

    render(<DocumentationSection interfaceData={mockMermaidSectionData} />);

    const codeElement = await screen.findByText(mermaidContent);
    expect(codeElement).toBeInTheDocument();
  });

  test("initialises Mermaid on component mount", () => {
    render(<DocumentationSection interfaceData={mockSectionData} />);

    expect(mermaid.initialize).toHaveBeenCalledWith({ startOnLoad: true });
  });
});
