import React from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Listing from "../Listing";

import { packageDataState } from "../../../state/atoms";
import { mockPackage } from "../../../mocks";

import type { Package } from "../../../types";

const renderComponent = (mockPackageData: Package) => {
  render(
    <RecoilRoot
      initializeState={(snapshot: MutableSnapshot) => {
        return snapshot.set(packageDataState, mockPackageData);
      }}
    >
      <Listing />
    </RecoilRoot>
  );
};

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("Listing", () => {
  test("shows notification if package not published", () => {
    renderComponent({ ...mockPackage, status: "registered" });
    expect(
      screen.getByText(
        "A published charm is required to successfully save this form."
      )
    ).toBeInTheDocument();
  });

  test("doesn't show notification if package is published", () => {
    renderComponent(mockPackage);
    expect(
      screen.queryByText(
        "A published charm is required to successfully save this form."
      )
    ).not.toBeInTheDocument();
  });

  test("disables 'Revert' and 'Save' buttons by default", () => {
    renderComponent(mockPackage);
    expect(screen.getByRole("button", { name: "Revert" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  test("enables 'Revert' and 'Save' buttons if data changes", async () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);
    await user.type(screen.getByLabelText("Title:"), "Package title");
    expect(screen.getByRole("button", { name: "Revert" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
  });

  test("resets data if 'Revert' is pressed", async () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);
    await user.type(screen.getByLabelText("Title:"), "Package title");
    await user.click(screen.getByRole("button", { name: "Revert" }));
    expect(screen.getByLabelText("Title:")).toHaveValue(mockPackage.title);
  });

  test("initialises form data correctly", () => {
    renderComponent(mockPackage);
    expect(screen.getByLabelText("Title:")).toHaveValue(mockPackage.title);
    expect(screen.getByLabelText("Summary:")).toHaveValue(mockPackage.summary);
    expect(screen.getByLabelText("Project homepage:")).toHaveValue(
      mockPackage.links.website?.[0] || ""
    );
    expect(screen.getByLabelText("Contact:")).toHaveValue(
      mockPackage.links.contact?.[0] || ""
    );
  });

  test("updates form fields correctly when user types input", async () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);

    const titleInput = screen.getByLabelText("Title:");
    const summaryInput = screen.getByLabelText("Summary:");
    const websiteInput = screen.getByLabelText("Project homepage:");
    const contactInput = screen.getByLabelText("Contact:");

    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    expect(titleInput).toHaveValue("Updated Title");

    await user.clear(summaryInput);
    await user.type(summaryInput, "Updated Summary");
    expect(summaryInput).toHaveValue("Updated Summary");

    await user.clear(websiteInput);
    await user.type(websiteInput, "https://new-website.com");
    expect(websiteInput).toHaveValue("https://new-website.com");

    await user.clear(contactInput);
    await user.type(contactInput, "new-contact@example.com");
    expect(contactInput).toHaveValue("new-contact@example.com");
  });

  test("disables Save and Revert buttons by default", () => {
    renderComponent(mockPackage);

    const saveButton = screen.getByRole("button", { name: "Save" });
    const revertButton = screen.getByRole("button", { name: "Revert" });

    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    expect(revertButton).toHaveAttribute("aria-disabled", "true");
  });

  test("enables Save and Revert buttons after changes", async () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);

    const saveButton = screen.getByRole("button", { name: "Save" });
    const revertButton = screen.getByRole("button", { name: "Revert" });

    const titleInput = screen.getByLabelText("Title:");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    expect(saveButton).not.toBeDisabled();
    expect(revertButton).not.toBeDisabled();
  });
});
