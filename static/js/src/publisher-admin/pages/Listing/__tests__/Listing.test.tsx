import React from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
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

const server = setupServer(
  http.patch(`/api/packages/${mockPackage.name}`, () => {
    return HttpResponse.json({
      data: mockPackage,
      message: "",
      success: true,
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

  test("shows success notification if data saved", () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);
    user.type(screen.getByLabelText("Title:"), "Package title");
    user.click(screen.getByRole("button", { name: "Save" }));
    waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        `${mockPackage.name} has been updated successfully`
      );
    });
  });

  test("shows error notification if error saving", () => {
    const user = userEvent.setup();
    server.use(
      http.patch(`/api/packages/${mockPackage.name}`, () => {
        return new HttpResponse(null, {
          status: 500,
        });
      })
    );
    renderComponent(mockPackage);
    user.type(screen.getByLabelText("Title:"), "Package title");
    user.click(screen.getByRole("button", { name: "Save" }));
    waitFor(() => {
      expect(
        screen.getByText(`There was a problem updating ${mockPackage.name}`)
      ).toBeInTheDocument();
    });
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

  test("disables 'Revert' button if no changes are made", () => {
    renderComponent(mockPackage);
    expect(screen.getByRole("button", { name: "Revert" })).toHaveAttribute("aria-disabled", "true");
  });

  test("disables 'Save' button if no changes are made", () => {
    renderComponent(mockPackage);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("aria-disabled", "true");
  });

  test("updates form fields correctly when user types input", () => {
    const user = userEvent.setup();
    renderComponent(mockPackage);

    user.type(screen.getByLabelText("Title:"), "Updated Title");
    waitFor(() => {
      expect(screen.getByLabelText("Title:")).toHaveValue("Updated Title");
    });

    user.type(screen.getByLabelText("Summary:"), "Updated Summary");
    waitFor(() => {
      expect(screen.getByLabelText("Summary:")).toHaveValue("Updated Summary");
    });

    user.type(
      screen.getByLabelText("Project homepage:"),
      "https://new-homepage.com"
    );
    waitFor(() => {
      expect(screen.getByLabelText("Project homepage:")).toHaveValue(
        "https://new-homepage.com"
      );
    });

    user.type(screen.getByLabelText("Contact:"), "new-contact@example.com");
    waitFor(() => {
      expect(screen.getByLabelText("Contact:")).toHaveValue(
        "new-contact@example.com"
      );
    });
  });
});
