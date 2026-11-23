import { setupValidation } from "../validation";

function renderForm() {
  document.body.innerHTML = `
    <form>
      <div class="p-form-validation">
        <input id="firstName" name="firstName" required>
      </div>
      <div class="p-form-validation">
        <input id="email" name="email" type="email" required>
      </div>
      <input type="hidden" name="acquisition_url">
      <input type="hidden" name="returnURL">
      <button type="submit">Submit</button>
    </form>
  `;
  const form = document.querySelector("form") as HTMLFormElement;
  (form.elements.namedItem("acquisition_url") as HTMLInputElement).value =
    window.location.href;
  (form.elements.namedItem("returnURL") as HTMLInputElement).value =
    `${window.location.origin}/thank-you#contact-form-success`;
  setupValidation(form);
  return form;
}

function submitForm(form: HTMLFormElement): Event {
  const event = new Event("submit", { cancelable: true });
  form.dispatchEvent(event);
  return event;
}

function type(id: string, value: string) {
  const field = document.getElementById(id) as HTMLInputElement;
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

const wrapper = (id: string) =>
  document.getElementById(id)?.closest(".p-form-validation") as HTMLElement;

describe("Field errors", () => {
  it("clears a field's error once it is fixed", () => {
    submitForm(renderForm());
    expect(wrapper("firstName").classList).toContain("is-error");

    type("firstName", "Ada");

    expect(wrapper("firstName").classList).not.toContain("is-error");
    expect(
      wrapper("firstName").querySelector(".js-validation-message")
    ).toBeNull();
    expect(wrapper("email").classList).toContain("is-error");
  });

  it("keeps the error while the field is still invalid", () => {
    submitForm(renderForm());

    type("email", "not-an-email");

    expect(wrapper("email").classList).toContain("is-error");
  });
});

describe("Submission URLs", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("sends the current page without its hash as acquisition_url", () => {
    const form = renderForm();
    type("firstName", "Ada");
    type("email", "ada@example.com");
    window.history.pushState({}, "", "/?q=postgresql#contact-form-fail");

    const submit = submitForm(form);
    const fields = new FormData(form);

    expect(submit.defaultPrevented).toBe(false);
    expect(fields.get("acquisition_url")).toBe(
      `${window.location.origin}/?q=postgresql`
    );
    expect(fields.get("returnURL")).toBe(
      `${window.location.origin}/thank-you#contact-form-success`
    );
  });
});
