/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  initialiseContactForm,
  fetchForm,
  updateHash,
  setProductContext,
  initialiseForm,
} from "../dynamic-contact-form";
import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

global.fetch = jest.fn();
const originalGa: any = (global as any).ga;
(global as any).ga = jest.fn() as any;
const originalLocation = window.location;

describe("Dynamic contact form", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    ((global as any).ga as jest.Mock).mockClear();
  });

  afterAll(() => {
    (global as any).ga = originalGa;
    window.location = originalLocation;
  });

  test("initialiseContactForm sets up event listeners and opens form on hash match", async () => {
    document.body.innerHTML = `
      <div id="contact-form-container" data-form-id="123" data-form-location="/get-in-touch"></div>
      <a class="js-invoke-modal" data-form-location="/get-in-touch" data-form-id="123">Contact Us</a>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      text: () => Promise.resolve("<form></form>"),
    });

    window.location.hash = "#get-in-touch";

    await initialiseContactForm();

    expect(global.fetch).toHaveBeenCalledWith("/get-in-touch");

    expect((global as any).ga).toHaveBeenCalledWith(
      "send",
      "event",
      "interactive-forms",
      "open",
      window.location.pathname
    );

    window.location.hash = "#get-in-touch";
    window.dispatchEvent(new Event("hashchange"));

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("fetchForm updates form container with fetched HTML", async () => {
    document.body.innerHTML = `
      <div id="contact-form-container"></div>
    `;

    const mockData = {
      formLocation: "/get-in-touch",
      formId: "123",
      lpId: "456",
      returnUrl: "http://example.com",
      lpUrl: "http://example.com/lp",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      text: () =>
        Promise.resolve(
          "<form>%% formid %% %% lpId %% %% returnURL %% %% lpurl %%</form>"
        ),
    });

    await fetchForm(mockData);

    const formContainer = screen.getByText(
      "123 456 http://example.com http://example.com/lp"
    );
    expect(formContainer).toBeInTheDocument();
  });

  test("updateHash updates the URL hash", () => {
    const newHash = "#new-hash";
    updateHash(newHash);
    expect(window.location.hash).toBe(newHash);
  });

  test("fetchForm handles fetch errors", async () => {
    document.body.innerHTML = `<div id="contact-form-container"></div>`;

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const mockData = {
      formLocation: "/get-in-touch",
      formId: "123",
      lpId: "456",
      returnUrl: "http://example.com",
      lpUrl: "http://example.com/lp",
    };

    await fetchForm(mockData);

    expect((global as any).ga).not.toHaveBeenCalled();
  });

  test("setProductContext sets the product context correctly", () => {
    document.body.innerHTML = `
      <input id="product-context" />
      <a class="js-invoke-modal" href="/contact?product=tech">Contact</a>
    `;

    const contactButton = document.querySelector(
      ".js-invoke-modal"
    ) as HTMLAnchorElement;
    setProductContext(contactButton);

    const productContext = document.getElementById(
      "product-context"
    ) as HTMLInputElement;
    expect(productContext.value).toBe("tech");
  });

  test("initialiseForm sets up event listeners and handles form interactions", () => {
    document.body.innerHTML = `
      <div id="contact-form-container">
        <div id="contact-modal">
          <!-- Form Elements -->
          <button class="p-modal__close">Close</button>
          <button class="js-close">Close Modal</button>
          <div class="pagination">
            <a class="pagination__link--previous">Previous</a>
            <a class="pagination__link--next">Next</a>
          </div>
          <div class="js-pagination js-pagination--1">Page 1</div>
          <div class="js-pagination js-pagination--2 u-hide">Page 2</div>
          <div class="js-pagination js-pagination--3 u-hide">Page 3</div>
          <div class="js-pagination js-pagination--4 u-hide">Thank You</div>
          <button class="mktoButton">Submit</button>
          <input id="Comments_from_lead__c" />
          <div class="js-other-container">
            <input class="js-other-container__checkbox" type="checkbox" />
            <input class="js-other-container__input u-hide" type="text" />
          </div>
        </div>
      </div>
    `;

    initialiseForm();

    const nextButton = screen.queryByText("Next");
    const previousButton = screen.queryByText("Previous");
    expect(nextButton).toBeInTheDocument();
    expect(previousButton).toBeInTheDocument();

    if (nextButton) {
      fireEvent.click(nextButton);
      expect((global as any).ga).toHaveBeenCalledWith(
        "send",
        "event",
        "interactive-forms",
        "goto:2",
        window.location.pathname
      );
    }

    if (previousButton) {
      fireEvent.click(previousButton);
      expect((global as any).ga).toHaveBeenCalledWith(
        "send",
        "event",
        "interactive-forms",
        "goto:1",
        window.location.pathname
      );
    }

    const checkbox = screen.getByRole("checkbox");
    const textboxes = screen.queryAllByRole("textbox");
    expect(textboxes.length).toBeGreaterThan(0);

    const input = textboxes.find((tb) =>
      tb.classList.contains("js-other-container__input")
    );
    setTimeout(() => expect(input).not.toHaveClass("u-hide"), 0);

    fireEvent.change(checkbox, { target: { checked: true } });
    setTimeout(() => expect(input).not.toHaveClass("u-hide"), 0);

    fireEvent.change(checkbox, { target: { checked: false } });
    setTimeout(() => expect(input).toHaveClass("u-hide"), 0);

    fireEvent.click(screen.getByText("Submit"));
    setTimeout(
      () =>
        expect((global as any).ga).toHaveBeenCalledWith(
          "send",
          "event",
          "interactive-forms",
          "submitted",
          window.location.pathname
        ),
      0
    );
  });

  test("initialiseContactForm does not crash with missing elements", async () => {
    document.body.innerHTML = `
      <!-- No #contact-form-container or .js-invoke-modal elements -->
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      text: () => Promise.resolve("<form></form>"),
    });

    await initialiseContactForm();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
