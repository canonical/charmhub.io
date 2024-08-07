/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  initialiseContactForm,
  fetchForm,
  updateHash,
  setProductContext,
} from "../dynamic-contact-form";
import { screen } from "@testing-library/react";
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
});
