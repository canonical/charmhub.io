import React from "react";
import { render, screen, act } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";
import { InterfaceItem } from "../InterfaceItem";

const queryClient = new QueryClient();

const mockData = {
  key: "test-key",
  interface: "test_interface",
  description: "This is a test description.",
  required: true,
};

const mockCharmName = "test-charm";

describe("InterfaceItem Component", () => {
  test("renders with the 'Required' chip when required is set to true", async () => {
    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={mockData}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    expect(screen.getByText("test-key")).toBeInTheDocument();
    expect(screen.getByText("This is a test description.")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  test("renders without the 'Required' chip when required is set to false", async () => {
    const dataWithoutRequired = { ...mockData, required: false };

    await act(async () => {
      render(
        <RecoilRoot>
          <QueryClientProvider client={queryClient}>
            <InterfaceItem
              interfaceType="provides"
              interfaceData={dataWithoutRequired}
              charmName={mockCharmName}
            />
          </QueryClientProvider>
        </RecoilRoot>
      );
    });

    expect(screen.getByText("test-key")).toBeInTheDocument();
    expect(screen.getByText("This is a test description.")).toBeInTheDocument();
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });
});
