import React from "react";
import { render, screen } from "@testing-library/react";
import ProvidingCharms from "../ProvidingCharms";
import { mockProvidingCharmsData, noCharmsData } from "../../testUtils";
import "@testing-library/jest-dom";

describe("ProvidingCharms", () => {
  test("renders ProvidingCharms with providers correctly", () => {
    const { container } = render(
      <ProvidingCharms
        interfaceData={mockProvidingCharmsData}
        isCommunity={false}
      />
    );

    expect(screen.getByText(/Providing Test Interface/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured charms/i)).toBeInTheDocument();

    const iframes = container.querySelectorAll("iframe");
    expect(iframes[0].getAttribute("src")).toBe(
      "/Provider1/embedded/interface"
    );
    expect(iframes[1].getAttribute("src")).toBe(
      "/Provider2/embedded/interface"
    );

    expect(screen.getByText(/Other charms/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 2/i)).toBeInTheDocument();

    expect(screen.getByText(/How to test a charm/i)).toBeInTheDocument();
  });

  test("renders ProvidingCharms with no charms correctly", () => {
    render(
      <ProvidingCharms interfaceData={noCharmsData} isCommunity={false} />
    );

    expect(screen.getByText(/Providing Test Interface/i)).toBeInTheDocument();
    expect(screen.queryByText(/Featured charms/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Other charms/i)).not.toBeInTheDocument();
    expect(screen.getByText(/How to test a charm/i)).toBeInTheDocument();
  });

  test('does not render "How to test a charm" link when isCommunity is true', () => {
    const { container } = render(
      <ProvidingCharms
        interfaceData={mockProvidingCharmsData}
        isCommunity={true}
      />
    );

    expect(screen.getByText(/Providing Test Interface/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured charms/i)).toBeInTheDocument();

    const iframes = container.querySelectorAll("iframe");
    expect(iframes.length).toBe(2);
    expect(iframes[0].getAttribute("src")).toBe(
      "/Provider1/embedded/interface"
    );
    expect(iframes[1].getAttribute("src")).toBe(
      "/Provider2/embedded/interface"
    );

    expect(screen.getByText(/Other charms/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Other Charm 2/i)).toBeInTheDocument();

    expect(screen.queryByText(/How to test a charm/i)).not.toBeInTheDocument();
  });
});
