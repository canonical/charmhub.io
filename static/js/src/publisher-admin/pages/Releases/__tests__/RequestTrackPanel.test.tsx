import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import RequestTrackPanel from "../RequestTrackPanel";
import userEvent from "@testing-library/user-event";

const onClose = vi.fn();

const renderComponent = () =>
  render(<RequestTrackPanel charmName="test" onClose={onClose} />);

describe("RequestTrackPanel", () => {
  test("calls on close when cancel is clicked", async () => {
    renderComponent();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  test("redirects to charmhub forum when request is issued", async () => {
    renderComponent();
    window.open = vi.fn();

    await userEvent.click(screen.getByText("Request on Forum"));

    expect(window.open).toHaveBeenCalledWith(
      `https://discourse.charmhub.io/new-topic?title=Create+new+track+for+"test"&category=charmhub+requests`,
      "_blank"
    );
  });
});
