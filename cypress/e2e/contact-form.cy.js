/// <reference types="cypress" />

const MARKETO_SUBMIT = "https://ubuntu.com/marketo/submit";

// Mirrors ubuntu.com/marketo/submit: success redirects to returnURL as-is,
// failure redirects to the returnURL page with #contact-form-fail
function mockUbuntuSubmit(result = "success", delay = 0) {
  cy.intercept("POST", MARKETO_SUBMIT, (req) => {
    const returnURL = new URL(new URLSearchParams(req.body).get("returnURL"));
    // The full page returns to production; stay on the local server
    const local = new URL(
      returnURL.pathname + returnURL.search,
      "http://localhost:8045"
    );
    local.hash = returnURL.hash;
    if (result === "fail") {
      local.search = "";
      local.hash = "contact-form-fail";
    }
    req.reply({
      statusCode: 302,
      headers: { location: local.href },
      delay,
    });
  }).as("marketoSubmit");
}

// Cypress cannot turn JS off, so strip scripts and inline handlers from HTML
function disableJavaScript() {
  cy.intercept({ method: "GET", url: "http://localhost:8045/**" }, (req) => {
    req.on("response", (res) => {
      const type = res.headers["content-type"] || "";
      if (type.includes("text/html") && typeof res.body === "string") {
        const doc = new DOMParser().parseFromString(res.body, "text/html");
        doc.querySelectorAll("script").forEach((script) => script.remove());
        doc.querySelectorAll("*").forEach((element) => {
          Array.from(element.attributes)
            .filter((attribute) => attribute.name.startsWith("on"))
            .forEach((attribute) => element.removeAttribute(attribute.name));
        });
        res.body = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
      }
    });
  });
}

function fillForm() {
  cy.get('input[name="firstName"]').type("Test");
  cy.get('input[name="lastName"]').type("User");
  cy.get('input[name="email"]').type("test.user@example.com");
  cy.get('select[name="country"]').select("NL");
  cy.get('input[name="company"]').type("Example Ltd");
  cy.get('input[name="title"]').type("Engineer");
  cy.get('textarea[name="Comments_from_lead__c"]').type("Hello");
}

function openPopUp() {
  cy.get("footer").contains("a", "Contact us").click();
}

// Fills and sends the form on the page, then yields the fields Marketo got
function submitForm(changeAnswers = () => {}) {
  cy.get(".js-contact-form").within(() => {
    fillForm();
    changeAnswers();
    cy.get('[type="submit"]').click();
  });
  return cy
    .wait("@marketoSubmit")
    .then(({ request }) => new URLSearchParams(request.body));
}

function dataLayerEvents() {
  return cy
    .window()
    .then((win) => (win.dataLayer || []).map((entry) => entry.event));
}

describe("Contact form", () => {
  beforeEach(() => {
    // Hide the cookie banner, which covers the footer
    cy.setCookie("_cookies_accepted", "essential");
  });

  it("Sends no State, which form 8143 does not have", () => {
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");
    openPopUp();
    cy.get('.js-contact-modal [name="State"]').should("not.exist");

    submitForm(() => {
      cy.get('select[name="country"]').select("US");
    }).then((fields) => {
      expect(fields.get("country")).to.equal("US");
      expect(fields.has("State")).to.equal(false);
    });
  });

  it("Keeps keyboard focus in the pop-up and restores it on close", () => {
    cy.visit("http://localhost:8045/");
    cy.get("footer .js-contact-link").focus();
    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.focused().should("have.attr", "role", "dialog");
    cy.get(".js-contact-modal [role=dialog]").should(
      "have.attr",
      "aria-modal",
      "true"
    );

    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should("have.class", "js-contact-modal-close");
    cy.focused().trigger("keydown", { key: "Tab", shiftKey: true });
    cy.focused().should("have.attr", "type", "submit");
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should("have.class", "js-contact-modal-close");
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should("have.attr", "name", "firstName");

    cy.get('.js-contact-form select[name="country"]').select("NL");
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.focused().should("have.attr", "name", "Comments_from_lead__c");
    cy.press(Cypress.Keyboard.Keys.ESC);
    cy.get(".js-contact-modal").should("not.be.visible");
    cy.focused().should("have.class", "js-contact-link");

    cy.press(Cypress.Keyboard.Keys.ENTER);
    cy.get(".js-contact-modal-close").click();
    cy.get(".js-contact-modal").should("not.be.visible");
    cy.focused().should("have.class", "js-contact-link");
  });

  ["success", "fail"].forEach((result) => {
    it(`Keeps keyboard focus in the ${result} panel after returning`, () => {
      cy.visit(`http://localhost:8045/#contact-form-${result}`);
      cy.focused().should("have.attr", "role", "dialog");
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should("have.class", "js-contact-modal-close");
      cy.focused().trigger("keydown", { key: "Tab", shiftKey: true });
      if (result === "success") {
        cy.focused().should("have.attr", "href", "http://askubuntu.com");
      } else {
        cy.focused().should("have.attr", "type", "submit");
      }
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should("have.class", "js-contact-modal-close");

      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get(".js-contact-modal").should("not.be.visible");
      cy.focused().should("have.class", "js-contact-link");
    });
  });

  it("Footer link → pop-up → success", () => {
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");

    openPopUp();
    cy.get(".js-contact-modal").should("be.visible");
    cy.location("pathname").should("eq", "/");

    submitForm();
    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#contact-form-success");
    cy.get(".js-contact-modal")
      .should("be.visible")
      .and("contain", "Thanks for contacting us.")
      .and("contain", "A member of our team will be in touch shortly.");
  });

  it("Returns to the current search after a pop-up submission", () => {
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");

    cy.get("#search").type("postgresql{enter}");
    cy.location("search").should("include", "q=postgresql");
    cy.location("href").then((currentURL) => {
      const returnURL = new URL(currentURL);
      returnURL.hash = "contact-form-success";

      openPopUp();
      submitForm().then((fields) => {
        expect(fields.get("formid")).to.equal("8143");
        expect(fields.get("returnURL")).to.equal(returnURL.href);
        expect(fields.get("acquisition_url")).to.equal(currentURL);
      });
      cy.location("search").should("eq", returnURL.search);
      cy.get(".js-contact-success")
        .should("be.visible")
        .and("contain", "Thanks for contacting us.");
    });
  });

  ["pop-up", "full page"].forEach((mode) => {
    ["success", "fail"].forEach((result) => {
      it(`Handles ${result} from the ${mode} when session storage is blocked`, () => {
        cy.setCookie("_cookies_accepted", "all");
        cy.on("window:before:load", (win) => {
          Object.defineProperty(win, "sessionStorage", {
            get() {
              throw new win.DOMException("Storage blocked", "SecurityError");
            },
          });
        });
        mockUbuntuSubmit(result);
        const path = mode === "pop-up" ? "/" : "/contact-us";
        cy.visit(`http://localhost:8045${path}?utm_source=google&gclid=abc`);
        if (mode === "pop-up") openPopUp();
        cy.get(".js-contact-form").within(() => {
          fillForm();
          cy.get('[type="submit"]').then(($button) => {
            $button[0].click();
            expect($button[0].disabled).to.equal(true);
          });
        });
        cy.wait("@marketoSubmit").then(({ request }) => {
          const fields = new URLSearchParams(request.body);
          expect(fields.get("utm_source")).to.equal("");
          expect(fields.get("GCLID__c")).to.equal("");
        });

        if (result === "success") {
          cy.contains("Thanks for contacting us.").should("be.visible");
          if (mode === "full page") {
            cy.location("pathname").should("eq", "/thank-you");
          }
        } else {
          cy.contains(
            "There was an error while sending your message. Please try again."
          ).should("be.visible");
          cy.contains("Try again").should("not.exist");
          cy.get('.js-contact-form input[name="firstName"]').should(
            "have.value",
            ""
          );
          cy.get('.js-contact-form [type="submit"]').should("not.be.disabled");
        }
      });
    });
  });

  it("Required field missing", () => {
    let requests = 0;
    cy.intercept("POST", MARKETO_SUBMIT, () => {
      requests += 1;
    });
    cy.visit("http://localhost:8045/");
    openPopUp();

    cy.get(".js-contact-modal").within(() => {
      cy.get('[type="submit"]').click();

      // be.visible misreports inside the scrolling fixed-position modal
      cy.get("[required]").each(($field) => {
        cy.wrap($field)
          .closest(".p-form-validation")
          .should("have.class", "is-error")
          .find(".p-form-validation__message")
          .should("have.css", "display", "block")
          .and("not.be.empty");
      });
      cy.focused().should("have.attr", "name", "firstName");
      cy.get('[type="submit"]').should("not.be.disabled");
    });

    cy.get(".js-contact-modal").should("be.visible");
    dataLayerEvents().then((events) => {
      expect(events).not.to.include("contact_form_submitted");
      expect(requests).to.equal(0);
    });
  });

  it("Send button while sending", () => {
    mockUbuntuSubmit("success", 3000);
    cy.visit("http://localhost:8045/");
    openPopUp();

    cy.get(".js-contact-modal").within(() => {
      fillForm();
      // Check before Cypress waits for the next page to load
      cy.get('[type="submit"]').then(($button) => {
        $button[0].click();
        expect($button[0].disabled).to.equal(true);
      });
    });
  });

  [
    { mode: "pop-up", path: "/" },
    { mode: "full page", path: "/contact-us" },
  ].forEach(({ mode, path }) => {
    it(`${mode} → ubuntu.com returns #contact-form-fail`, () => {
      mockUbuntuSubmit("fail");
      cy.visit(`http://localhost:8045${path}`);
      if (mode === "pop-up") openPopUp();

      submitForm();
      cy.location("pathname").should("eq", path);
      cy.location("hash").should("eq", "#contact-form-fail");
      cy.contains(
        "There was an error while sending your message. Please try again."
      ).should("be.visible");
      dataLayerEvents().should("include", "contact_form_failed");

      cy.get(".js-contact-form").within(() => {
        cy.contains("Try again").should("not.exist");
        cy.get('input[name="firstName"]').should("have.value", "Test");
        cy.get('input[name="email"]').should(
          "have.value",
          "test.user@example.com"
        );
        cy.get('select[name="country"]').should("have.value", "NL");
        cy.get('textarea[name="Comments_from_lead__c"]').should(
          "have.value",
          "Hello"
        );
      });

      // A later page load starts empty
      cy.visit(`http://localhost:8045${path}`);
      if (mode === "pop-up") openPopUp();
      cy.get('.js-contact-form input[name="firstName"]').should(
        "have.value",
        ""
      );
      cy.get(".js-contact-error").should("not.be.visible");
    });
  });

  function sendFromLandingLink(consent) {
    cy.setCookie("_cookies_accepted", consent);
    mockUbuntuSubmit();
    cy.visit(
      "http://localhost:8045/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=ad1&utm_term=juju&gclid=g123&fbclid=f456"
    );
    openPopUp();
    return submitForm();
  }

  it("Cookies accepted", () => {
    sendFromLandingLink("all").then((body) => {
      expect(body.get("utm_source")).to.equal("google");
      expect(body.get("utm_medium")).to.equal("cpc");
      expect(body.get("utm_campaign")).to.equal("spring");
      expect(body.get("utm_content")).to.equal("ad1");
      expect(body.get("utm_term")).to.equal("juju");
      expect(body.get("GCLID__c")).to.equal("g123");
      expect(body.get("Facebook_Click_ID__c")).to.equal("f456");
      expect(body.get("_cookies_accepted")).to.equal("all");
    });
  });

  it("Cookies rejected", () => {
    sendFromLandingLink("essential").then((body) => {
      [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "GCLID__c",
        "Facebook_Click_ID__c",
      ].forEach((name) => {
        expect(body.get(name) || "", name).to.equal("");
      });
    });
  });

  it("No JS → full page success", () => {
    disableJavaScript();
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");

    // Without JS the footer link opens the full page
    cy.get("footer").contains("a", "Contact us").click();
    cy.location("pathname").should("eq", "/contact-us");

    submitForm().then((fields) => {
      expect(fields.get("returnURL")).to.equal(
        "https://charmhub.io/thank-you#contact-form-success"
      );
    });
    cy.location("pathname").should("eq", "/thank-you");
    cy.contains("Thanks for contacting us");
  });
});
