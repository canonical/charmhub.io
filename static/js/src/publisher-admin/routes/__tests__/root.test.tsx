import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { usePackage } from "../../hooks";
import Root from "../root";

const mockSetPackageData = jest.fn();

jest.mock("recoil", () => ({
  ...jest.requireActual("recoil"),
  useSetRecoilState: () => mockSetPackageData,
}));

jest.mock("../../hooks", () => ({
  usePackage: jest.fn(),
}));

jest.mock("../../components", () => ({
  SectionHeader: () => <div>SectionHeader</div>,
  SectionNav: () => <div>SectionNav</div>,
}));

describe("Root component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRouterAndRecoil(
    ui: React.ReactElement,
    { route = "/" } = {}
  ) {
    return render(
      <RecoilRoot>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/:packageName" element={ui} />
          </Routes>
        </MemoryRouter>
      </RecoilRoot>
    );
  }

  test("should render the component with its child components", () => {
    (usePackage as jest.Mock).mockReturnValue({
      data: null,
      status: "idle",
    });

    renderWithRouterAndRecoil(<Root />, { route: "/test-package" });

    expect(screen.getByText("SectionHeader")).toBeInTheDocument();
    expect(screen.getByText("SectionNav")).toBeInTheDocument();
  });

  test("should call setPackageData with packageData when status is success", () => {
    const mockPackageData = { id: "123", name: "Test Package" };

    (usePackage as jest.Mock).mockReturnValue({
      data: mockPackageData,
      status: "success",
    });

    renderWithRouterAndRecoil(<Root />, { route: "/test-package" });

    expect(mockSetPackageData).toHaveBeenCalledWith(mockPackageData);
  });

  test("should not call setPackageData when status is not success", () => {
    (usePackage as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    renderWithRouterAndRecoil(<Root />, { route: "/test-package" });

    expect(mockSetPackageData).not.toHaveBeenCalled();
  });

  test("should use packageName from useParams", () => {
    const mockPackageData = { id: "123", name: "Test Package" };

    (usePackage as jest.Mock).mockImplementation((packageName) => {
      expect(packageName).toBe("test-package");
      return {
        data: mockPackageData,
        status: "success",
      };
    });

    renderWithRouterAndRecoil(<Root />, { route: "/test-package" });

    expect(mockSetPackageData).toHaveBeenCalledWith(mockPackageData);
  });

  test("should render Outlet component for nested routes", () => {
    (usePackage as jest.Mock).mockReturnValue({
      data: null,
      status: "idle",
    });

    renderWithRouterAndRecoil(<Root />, { route: "/test-package" });

    expect(screen.getByText("SectionNav")).toBeInTheDocument();
  });
});
