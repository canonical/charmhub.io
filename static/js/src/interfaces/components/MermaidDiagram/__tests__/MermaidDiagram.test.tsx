import React from "react";
import { render, waitFor } from "@testing-library/react";
import MermaidDiagram from "../MermaidDiagram";
import mermaid from "mermaid";
import { Mock } from "vitest";

vi.mock("mermaid", async (importOriginal) => ({
  default: {
    ...(await importOriginal<typeof mermaid>()),
    render: vi.fn(),
  },
}));

describe("MermaidDiagram", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders the mermaid diagram", async () => {
    const mockSvg = "<svg>mock diagram</svg>";
    (mermaid.render as Mock).mockResolvedValueOnce({ svg: mockSvg });

    const { container } = render(<MermaidDiagram code="graph TD; A-->B;" />);

    expect(mermaid.render).toHaveBeenCalledWith(
      "mermaidId",
      "graph TD; A-->B;"
    );

    await waitFor(() => {
      expect(
        container.querySelector(".mermaid-diagram-container")?.innerHTML
      ).toBe(mockSvg);
    });
  });

  test("handles rendering error", async () => {
    const mockError = new Error("Mock render error");
    (mermaid.render as Mock).mockRejectedValueOnce(mockError);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<MermaidDiagram code="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Mermaid diagram rendering error:",
        mockError
      );
    });

    consoleErrorSpy.mockRestore();
  });
});
