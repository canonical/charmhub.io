import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTrackPanel from "../AddTrackPanel";
import "@testing-library/jest-dom";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import { usePackage } from "../../../hooks";
import { mockPackage } from "../../../mocks";

global.fetch = jest.fn();

const queryClient = new QueryClient();

jest.mock("../../../hooks/usePackage");
const mockUsePackage = usePackage as jest.Mock;

mockUsePackage.mockReturnValue({ data: mockPackage, refetch: jest.fn() });

const renderComponent = ({
  charmName = "my-charm",
  onClose = jest.fn(),
  setSelectedTrack = jest.fn(),
}) => {
  return render(
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <AddTrackPanel
          charmName={charmName}
          onClose={onClose}
          setSelectedTrack={setSelectedTrack}
        />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

describe("AddTrackPanel", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test("renders correctly", () => {
    renderComponent({});

    expect(screen.getByText("Add Track")).toBeInTheDocument();
    expect(screen.getByLabelText("* Track name")).toBeInTheDocument();
    expect(screen.getByLabelText("* Track name")).toHaveValue("");
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("calls onClose when Cancel button is clicked", () => {
    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(screen.getByText("Cancel"));

    expect(onClose).toHaveBeenCalled();
  });

  test("selects newly created track when add button is clicked, happy flow", async () => {
    const setSelectedTrack = jest.fn();

    renderComponent({ setSelectedTrack });

    const trackName = "stable";

    fireEvent.change(screen.getByLabelText("* Track name"), {
      target: { value: trackName },
    });

    (global.fetch as jest.Mock).mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Add Track"));
    });

    expect(setSelectedTrack).toHaveBeenCalledWith(trackName);
  });

  test("disables add track button on error", async () => {
    renderComponent({});
    const trackName = "stable";

    fireEvent.change(screen.getByLabelText("* Track name"), {
      target: { value: trackName },
    });

    (global.fetch as jest.Mock).mockReturnValue(
      Promise.resolve({
        json: () => Promise.resolve({ error: "track already exists" }),
        ok: false,
      })
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Add Track"));
    });
    expect(screen.getByText("Add Track")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });

  test("disables add track button when track name is empty", () => {
    renderComponent({});

    expect(screen.getByText("Add Track")).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});
