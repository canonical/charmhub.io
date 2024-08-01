import React from "react";
import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import MultiSelect from "../multiselect";

const defaultProps = {
  value: [],
  values: [
    { name: "Option 1", key: "1" },
    { name: "Option 2", key: "2" },
    { name: "Option 3", key: "3" },
  ],
  updateHandler: jest.fn(),
};

describe("MultiSelect Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    render(<MultiSelect {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();
  });

  test("displays all available options when dropdown is opened", () => {
    render(<MultiSelect {...defaultProps} />);
    fireEvent.click(screen.getByRole("textbox"));
    defaultProps.values.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  test("adds an item to the selected list on option click", async () => {
    render(<MultiSelect {...defaultProps} />);
    fireEvent.click(screen.getByRole("textbox"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Option 1" },
    });

    const option = screen.getByText("Option 1");
    fireEvent.click(option);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  test("clicking outside the component blurs it", () => {
    render(<MultiSelect {...defaultProps} />);
    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    expect(screen.getByRole("textbox")).not.toHaveFocus();
  });

  test("handles keyboard navigation correctly", async () => {
    render(<MultiSelect {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });

    await waitFor(() => {
      const option2 = screen.getByText("Option 2");
      expect(option2).toHaveClass("is-highlighted");
    });
  });

  test("renders with pre-selected items", () => {
    const props = {
      ...defaultProps,
      value: ["1"],
      values: [
        { name: "Option 1", key: "1" },
        { name: "Option 2", key: "2" },
        { name: "Option 3", key: "3" },
      ],
    };

    render(<MultiSelect {...props} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  test("renders with no options when values prop is empty", () => {
    const props = {
      value: [],
      values: [],
      updateHandler: jest.fn(),
    };

    render(<MultiSelect {...props} />);
    fireEvent.click(screen.getByRole("textbox"));

    const optionsList = screen.queryByRole("list");
    expect(optionsList).toBeEmptyDOMElement();
  });
});
