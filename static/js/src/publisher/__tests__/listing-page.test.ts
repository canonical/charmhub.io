import { ListingForm } from "../listing-page";
import "@testing-library/jest-dom";

describe("ListingForm", () => {
  let form: ListingForm;
  let initialState: { [key: string]: string };

  beforeEach(() => {
    initialState = {
      title: "",
      summary: "",
      website: "",
      contact: "",
    };

    document.body.innerHTML = `
      <form id="market-form">
        <div class="p-form-validation">
          <input name="title" id="title" type="text" />
        </div>
        <div class="p-form-validation">
          <textarea name="summary" id="summary"></textarea>
        </div>
        <div class="p-form-validation">
          <input name="website" id="website" type="url" />
        </div>
        <div class="p-form-validation">
          <input name="contact" id="contact" type="text" />
        </div>
        <button class="js-action-button"></button>
      </form>
    `;

    form = new ListingForm("#market-form", initialState);
  });

  test("should throw an error if the form element is not found", () => {
    document.body.innerHTML = "";
    expect(() => new ListingForm("#market-form", initialState)).toThrow(
      "#market-form is not a valid element"
    );
  });

  test("should initialise form inputs", () => {
    expect(form.validation.title).toMatchObject({ isValid: true });
    expect(form.validation.summary).toMatchObject({ isValid: true });
    expect(form.validation.website).toMatchObject({ isValid: true, url: true });
    expect(form.validation.contact).toMatchObject({
      isValid: true,
      mailto: true,
    });
  });

  test("should validate URL input", () => {
    const websiteInput = document.querySelector(
      'input[name="website"]'
    ) as HTMLInputElement;
    websiteInput.value = "example";
    form.validateInput(websiteInput);
    const validationElement = websiteInput.closest(".p-form-validation");
    expect(validationElement).not.toBeNull();
    expect(validationElement?.classList).toContain("is-error");

    websiteInput.value = "https://example.com";
    form.validateInput(websiteInput);
    expect(validationElement?.classList).not.toContain("is-error");
  });

  test("should prefix website input with https://", () => {
    const websiteInput = document.querySelector(
      'input[name="website"]'
    ) as HTMLInputElement;
    websiteInput.value = "example.com";
    form.prefixInput(websiteInput);
    expect(websiteInput.value).toBe("https://example.com");
  });

  test("should prefix contact input with mailto:", () => {
    const contactInput = document.querySelector(
      'input[name="contact"]'
    ) as HTMLInputElement;
    contactInput.value = "email@example.com";
    form.prefixInput(contactInput);
    expect(contactInput.value).toBe("mailto:email@example.com");
  });

  test("should handle input changes", () => {
    const titleInput = document.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    titleInput.value = "New Title";
    titleInput.dispatchEvent(new Event("input"));
    setTimeout(() => {
      expect(form.currentState.title).toBe("New Title");
    }, 0);
  });

  test("should enable action buttons when form state changes", () => {
    const actionButton = document.querySelector(
      ".js-action-button"
    ) as HTMLButtonElement;

    const titleInput = document.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    titleInput.value = "New Title";
    titleInput.dispatchEvent(new Event("input"));

    expect(actionButton.disabled).toBe(false);
    expect(actionButton.classList.contains("is-disabled")).toBe(false);
  });

  test("should disable action buttons if there are no changes", () => {
    const actionButton = document.querySelector(
      ".js-action-button"
    ) as HTMLButtonElement;

    actionButton.disabled = false;
    actionButton.classList.remove("is-disabled");

    const titleInput = document.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    titleInput.value = "";
    titleInput.dispatchEvent(new Event("input"));

    setTimeout(() => {
      expect(actionButton.disabled).toBe(true);
      expect(actionButton.classList.contains("is-disabled")).toBe(true);
    }, 0);
  });

  test("should detect changes in the form state", () => {
    const titleInput = document.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    titleInput.value = "Updated Title";
    titleInput.dispatchEvent(new Event("input"));
    setTimeout(() => {
      expect(form.diffState()).toBe(true);
    }, 0);
  });

  test("should validate the entire form", () => {
    const titleInput = document.querySelector(
      'input[name="title"]'
    ) as HTMLInputElement;
    const websiteInput = document.querySelector(
      'input[name="website"]'
    ) as HTMLInputElement;
    titleInput.value = "Title";
    websiteInput.value = "https://valid-url.com";

    titleInput.dispatchEvent(new Event("input"));
    websiteInput.dispatchEvent(new Event("input"));

    expect(form.isFormValid()).toBe(true);
  });
});
