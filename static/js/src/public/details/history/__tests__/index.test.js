import { init } from "../index";
import { TableShowMore } from "../tableShowMore";

jest.mock("../tableShowMore", () => {
  return {
    TableShowMore: jest.fn(),
  };
});

describe("init function", () => {
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.resetAllMocks();
  });

  test("should instantiate TableShowMore if the table element exists", () => {
    container.innerHTML = '<table class="test-table"></table>';

    init(".test-table");

    expect(TableShowMore).toHaveBeenCalledWith(
      container.querySelector(".test-table")
    );
  });

  test("should throw an error if the table element does not exist", () => {
    container.innerHTML = "";

    expect(() => {
      init(".test-table");
    }).toThrow("There is no element containing .test-table selector.");
  });
});
