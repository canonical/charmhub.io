import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddTrackPanel from "../AddTrackPanel";
import "@testing-library/jest-dom";
import { RecoilRoot } from "recoil";
import { QueryClient, QueryClientProvider } from "react-query";
import { usePackage } from "../../../hooks";
import { mockPackage } from "../../../mocks";
import { Mock } from "vitest";

globalThis.fetch = vi.fn();

const queryClient = new QueryClient();

vi.mock("../../../hooks/usePackage");
const mockUsePackage = usePackage as Mock;

mockUsePackage.mockReturnValue({ data: mockPackage, refetch: vi.fn() });

const renderComponent = ({
  charmName = "my-charm",
  onClose = vi.fn(),
  setSelectedTrack = vi.fn(),
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
    (global.fetch as Mock).mockClear();
  });

  test("renders correctly", () => {
    renderComponent({});

    expect(screen.getByText("Add Track")).toBeInTheDocument();
    expect(screen.getByLabelText("* Track name")).toBeInTheDocument();
    expect(screen.getByLabelText("* Track name")).toHaveValue("");
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("calls onClose when Cancel button is clicked", () => {
    const onClose = vi.fn();

    renderComponent({ onClose });

    fireEvent.click(screen.getByText("Cancel"));

    expect(onClose).toHaveBeenCalled();
  });

  test("selects newly created track when add button is clicked, happy flow", async () => {
    const setSelectedTrack = vi.fn();

    renderComponent({ setSelectedTrack });

    const trackName = "stable";

    fireEvent.change(screen.getByLabelText("* Track name"), {
      target: { value: trackName },
    });

    (global.fetch as Mock).mockReturnValue(
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

    (global.fetch as Mock).mockReturnValue(
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
