import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ListingInputField, {
  ListingInputFieldProps,
} from "../ListingInputField";

import { mockPackage } from "../../../mocks";

const renderComponent = (props?: Partial<ListingInputFieldProps>) => {
  render(
    <ListingInputField
      label="Title"
      name="title"
      value={mockPackage.title}
      handleInputChange={jest.fn()}
      {...props}
    />
  );
};

describe("ListingInputField", () => {
  test("displays the correct label and value", () => {
    renderComponent();
    expect(screen.getByLabelText("Title:")).toHaveValue(mockPackage.title);
  });

  test("displays help text", () => {
    renderComponent({
      helpText: "This is some help text for this input field",
    });
    expect(
      screen.getByText("This is some help text for this input field")
    ).toBeInTheDocument();
  });

  test("calls onChange handler", async () => {
    const user = userEvent.setup();
    const handleInputChange = jest.fn();

    renderComponent({ handleInputChange });
    await user.type(screen.getByLabelText("Title:"), mockPackage.title);
    expect(handleInputChange).toHaveBeenCalled();
  });
});
