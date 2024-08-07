import React from "react";
import { render, screen } from "@testing-library/react";
import RequiringCharms from "../RequiringCharms";
import { mockRequiringCharmsData, noCharmsData } from "../../testUtils";
import "@testing-library/jest-dom";

describe("RequiringCharms", () => {
  test("renders RequiringCharms with requirers and other charms correctly", () => {
    const { container } = render(
      <RequiringCharms
        interfaceData={mockRequiringCharmsData}
        isCommunity={false}
      />
    );

    expect(screen.getByText(/Requiring Test Interface/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured charms/i)).toBeInTheDocument();

    const iframes = container.querySelectorAll("iframe");
    expect(iframes.length).toBe(2);
    expect(iframes[0].getAttribute("src")).toBe(
      "/Requirer1/embedded/interface"
    );
    expect(iframes[1].getAttribute("src")).toBe(
      "/Requirer2/embedded/interface"
    );

    expect(screen.getByText(/Other charms/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 2/i)).toBeInTheDocument();

    expect(screen.getByText(/How to test a charm/i)).toBeInTheDocument();
  });

  test("renders RequiringCharms with no requirers correctly", () => {
    render(
      <RequiringCharms interfaceData={noCharmsData} isCommunity={false} />
    );

    expect(screen.getByText(/Requiring Test Interface/i)).toBeInTheDocument();
    expect(screen.queryByText(/Featured charms/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Other charms/i)).not.toBeInTheDocument();
    expect(screen.getByText(/How to test a charm/i)).toBeInTheDocument();
  });

  test('does not render "How to test a charm" link when isCommunity is true', () => {
    const { container } = render(
      <RequiringCharms
        interfaceData={mockRequiringCharmsData}
        isCommunity={true}
      />
    );

    expect(screen.getByText(/Requiring Test Interface/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured charms/i)).toBeInTheDocument();

    const iframes = container.querySelectorAll("iframe");
    expect(iframes.length).toBe(2);
    expect(iframes[0].getAttribute("src")).toBe(
      "/Requirer1/embedded/interface"
    );
    expect(iframes[1].getAttribute("src")).toBe(
      "/Requirer2/embedded/interface"
    );

    expect(screen.getByText(/Other charms/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 2/i)).toBeInTheDocument();

    expect(screen.queryByText(/How to test a charm/i)).not.toBeInTheDocument();
  });
});
