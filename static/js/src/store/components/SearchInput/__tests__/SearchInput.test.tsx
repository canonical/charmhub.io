import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { SearchInput } from "../SearchInput";

const Harness = () => {
  const ref = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  return (
    <>
      <SearchInput searchRef={ref as React.RefObject<HTMLInputElement>} />
      <div data-testid="location">{useLocation().search}</div>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
};

const setup = () => {
  render(
    <MemoryRouter
      initialEntries={["/?type=solutions&q=old&platforms=vm&page=2"]}
    >
      <Harness />
    </MemoryRouter>
  );
  return {
    user: userEvent.setup(),
    input: screen.getByRole("searchbox"),
    location: screen.getByTestId("location"),
  };
};

test("submits a trimmed search, resets page and syncs with history", async () => {
  const { user, input, location } = setup();

  await user.clear(input);
  await user.type(input, "  identity  {Enter}");

  expect(input).toHaveValue("identity");
  expect(location).toHaveTextContent("?type=solutions&q=identity&platforms=vm");

  await user.click(screen.getByRole("button", { name: "Back" }));
  expect(input).toHaveValue("old");
});

test.each(["X button", "blank submit"])(
  "clears only search and page via %s",
  async (method) => {
    const { user, input, location } = setup();

    if (method === "X button") {
      await user.click(screen.getByRole("button", { name: "Close" }));
    } else {
      await user.clear(input);
      await user.type(input, "   {Enter}");
    }

    expect(input).toHaveValue("");
    expect(location.textContent).toBe("?type=solutions&platforms=vm");
  }
);
