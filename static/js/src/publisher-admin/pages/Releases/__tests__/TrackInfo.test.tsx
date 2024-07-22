import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TrackInfo } from "../TrackInfo";

describe("TrackInfo", () => {
  test("renders track info correctly", () => {
    render(<TrackInfo versionPattern="1.0" automaticPhasingPercentage="10" />);
    expect(
      screen.getByText("Version pattern: 1.0 / Auto. phasing %: 10")
    ).toBeInTheDocument();

    // the tooltip icon
    expect(document.querySelector(".p-icon--information")).toBeInTheDocument();
  });
  test("renders track info with version pattern only", () => {
    render(
      <TrackInfo versionPattern="1.0" automaticPhasingPercentage={null} />
    );
    expect(screen.getByText("Version pattern: 1.0")).toBeInTheDocument();
    expect(screen.queryByText("Auto. phasing %:")).not.toBeInTheDocument();
  });
  test("renders track info with automatic phasing percentage only", () => {
    render(<TrackInfo versionPattern={null} automaticPhasingPercentage="10" />);
    expect(screen.queryByText("Version pattern:")).not.toBeInTheDocument();
    expect(screen.getByText("Auto. phasing %: 10")).toBeInTheDocument();
  });
  test("is not rendered when no version pattern or automatic phasing percentage", () => {
    render(
      <TrackInfo versionPattern={null} automaticPhasingPercentage={null} />
    );
    expect(screen.queryByText("Version pattern:")).not.toBeInTheDocument();
    expect(screen.queryByText("Auto. phasing %:")).not.toBeInTheDocument();
  });
});
