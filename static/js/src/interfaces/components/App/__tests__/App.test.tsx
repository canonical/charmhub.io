import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom";

vi.mock("../../InterfacesIndex", () => ({
  default: () => <div>InterfacesIndex Component</div>,
}));
vi.mock("../../InterfaceDetails", () => ({
  default: () => <div>InterfaceDetails Component</div>,
}));

describe("App component", () => {
  const renderAppAtPath = (path: string) => {
    window.history.pushState({}, "Test Page", path);
    render(<App />);
  };

  test("should render InterfacesIndex component for /integrations route", async () => {
    renderAppAtPath("/integrations");

    await waitFor(() => {
      expect(screen.getByText("InterfacesIndex Component")).toBeInTheDocument();
    });
  });

  test("should render InterfaceDetails component for /integrations/:interfaceName route", async () => {
    renderAppAtPath("/integrations/testInterface");

    await waitFor(() => {
      expect(
        screen.getByText("InterfaceDetails Component")
      ).toBeInTheDocument();
    });
  });
});
