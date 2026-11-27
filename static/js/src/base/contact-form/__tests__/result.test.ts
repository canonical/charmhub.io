import { clearResultHash, handleSubmitResult } from "../result";

type DataLayerWindow = Window & { dataLayer?: { event: string }[] };

const ANSWERS_KEY = "contact-form-answers";

function visit(path: string) {
  window.history.replaceState({}, "", path);
  const redirecting = handleSubmitResult();
  clearResultHash();
  return redirecting;
}

const events = () =>
  ((window as DataLayerWindow).dataLayer || []).map((entry) => entry.event);

describe("Submit result", () => {
  beforeEach(() => {
    window.sessionStorage.setItem(ANSWERS_KEY, '{"firstName":"Test"}');
    (window as DataLayerWindow).dataLayer = [];
    document.body.innerHTML = `
      <form class="js-contact-form">
        <div class="js-contact-error" hidden></div>
        <input name="firstName">
      </form>
    `;
  });

  afterEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("records a success once and removes the hash", () => {
    visit("/kafka?channel=stable#contact-form-success");

    expect(events()).toEqual(["contact_form_success"]);
    expect(window.sessionStorage.getItem(ANSWERS_KEY)).toBeNull();
    expect(window.location.pathname + window.location.search).toBe(
      "/kafka?channel=stable"
    );
    expect(window.location.hash).toBe("");

    // A refresh no longer repeats the result
    handleSubmitResult();
    expect(events()).toEqual(["contact_form_success"]);
  });

  it("shows the error, refills the form and removes the hash on failure", () => {
    visit("/contact-us#contact-form-fail");

    const error = document.querySelector(".js-contact-error") as HTMLElement;
    const firstName = document.querySelector(
      '[name="firstName"]'
    ) as HTMLInputElement;
    expect(error.hidden).toBe(false);
    expect(firstName.value).toBe("Test");
    expect(events()).toEqual(["contact_form_failed"]);
    expect(window.location.hash).toBe("");
  });

  it("leaves other hashes alone", () => {
    expect(visit("/kafka#readme")).toBe(false);

    expect(window.location.hash).toBe("#readme");
    expect(events()).toEqual([]);
  });
});
