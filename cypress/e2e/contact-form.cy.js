/// <reference types="cypress" />

const MARKETO_SUBMIT = "https://ubuntu.com/marketo/submit";

// Mirrors ubuntu.com/marketo/submit: success redirects to returnURL as-is,
// failure redirects to the returnURL page with #contact-form-fail
function mockUbuntuSubmit(result = "success", delay = 0) {
  cy.intercept("POST", MARKETO_SUBMIT, (req) => {
    const returnURL = new URL(new URLSearchParams(req.body).get("returnURL"));
    if (result === "fail") {
      returnURL.search = "";
      returnURL.hash = "contact-form-fail";
    }
    req.reply({
      statusCode: 302,
      headers: { location: returnURL.href },
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

describe("Contact form", () => {
  it("Keeps keyboard focus in the pop-up and restores it on close", () => {
    cy.setCookie("_cookies_accepted", "essential");
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
      cy.setCookie("_cookies_accepted", "essential");
      cy.visit(`http://localhost:8045/#contact-form-${result}`);
      cy.focused().should("have.attr", "role", "dialog");
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should("have.class", "js-contact-modal-close");
      cy.focused().trigger("keydown", { key: "Tab", shiftKey: true });
      if (result === "success") {
        cy.focused().should("have.attr", "href", "http://askubuntu.com");
      } else {
        cy.focused().should("have.class", "js-contact-try-again");
      }
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().should("have.class", "js-contact-modal-close");

      if (result === "fail") {
        cy.get(".js-contact-try-again").click();
        cy.focused().should("have.attr", "role", "dialog");
        cy.press(Cypress.Keyboard.Keys.TAB);
        cy.focused().trigger("keydown", { key: "Tab", shiftKey: true });
        cy.focused().should("have.attr", "type", "submit");
      }
      cy.press(Cypress.Keyboard.Keys.ESC);
      cy.get(".js-contact-modal").should("not.be.visible");
      cy.focused().should("have.class", "js-contact-link");
    });
  });

  it("Footer link → pop-up → success", () => {
    // Hide the cookie banner, which covers the footer
    cy.setCookie("_cookies_accepted", "essential");
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");

    cy.get("footer").contains("a", "Contact us").click();
    cy.get(".js-contact-modal").should("be.visible");
    cy.location("pathname").should("eq", "/");

    cy.get(".js-contact-modal").within(() => {
      fillForm();
      cy.get('[type="submit"]').click();
    });

    cy.wait("@marketoSubmit");
    cy.location("pathname").should("eq", "/");
    cy.location("hash").should("eq", "#contact-form-success");
    cy.get(".js-contact-modal")
      .should("be.visible")
      .and("contain", "Thanks for contacting us.")
      .and("contain", "A member of our team will be in touch shortly.");
  });

  it("Returns to the current search after a pop-up submission", () => {
    cy.setCookie("_cookies_accepted", "essential");
    mockUbuntuSubmit();
    cy.visit("http://localhost:8045/");

    cy.get("#search").type("postgresql{enter}");
    cy.location("search").should("include", "q=postgresql");
    cy.location("href").then((currentURL) => {
      const returnURL = new URL(currentURL);
      returnURL.hash = "contact-form-success";

      cy.get("footer").contains("a", "Contact us").click();
      cy.get(".js-contact-modal").within(() => {
        fillForm();
        cy.get('[type="submit"]').click();
      });

      cy.wait("@marketoSubmit").then(({ request }) => {
        const fields = new URLSearchParams(request.body);
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
        if (mode === "pop-up") {
          cy.get("footer").contains("a", "Contact us").click();
        }
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
          cy.contains(mode === "pop-up" ? "button" : "a", "Try again").click();
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
    cy.setCookie("_cookies_accepted", "essential");
    let requests = 0;
    cy.intercept("POST", MARKETO_SUBMIT, () => {
      requests += 1;
    });
    cy.visit("http://localhost:8045/");
    cy.get("footer").contains("a", "Contact us").click();

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
    cy.window().then((win) => {
      const events = (win.dataLayer || []).map((entry) => entry.event);
      expect(events).not.to.include("contact_form_submitted");
      expect(requests).to.equal(0);
    });
  });

  it("Send button while sending", () => {
    cy.setCookie("_cookies_accepted", "essential");
    mockUbuntuSubmit("success", 3000);
    cy.visit("http://localhost:8045/");
    cy.get("footer").contains("a", "Contact us").click();

    cy.get(".js-contact-modal").within(() => {
      fillForm();
      // Check before Cypress waits for the next page to load
      cy.get('[type="submit"]').then(($button) => {
        $button[0].click();
        expect($button[0].disabled).to.equal(true);
      });
    });
  });

  it("Pop-up → ubuntu.com returns #contact-form-fail", () => {
    cy.setCookie("_cookies_accepted", "essential");
    mockUbuntuSubmit("fail");
    cy.visit("http://localhost:8045/");
    cy.get("footer").contains("a", "Contact us").click();

    cy.get(".js-contact-modal").within(() => {
      fillForm();
      cy.get('[type="submit"]').click();
    });

    cy.wait("@marketoSubmit");
    cy.location("hash").should("eq", "#contact-form-fail");
    cy.get(".js-contact-modal")
      .should("be.visible")
      .and(
        "contain",
        "There was an error while sending your message. Please try again."
      );
    cy.window().then((win) => {
      const events = (win.dataLayer || []).map((entry) => entry.event);
      expect(events).to.include("contact_form_failed");
    });

    cy.get(".js-contact-modal").contains("button", "Try again").click();
    cy.get(".js-contact-modal").within(() => {
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
  });

  it("Full page → ubuntu.com returns #contact-form-fail", () => {
    cy.setCookie("_cookies_accepted", "essential");
    mockUbuntuSubmit("fail");
    cy.visit("http://localhost:8045/contact-us");

    fillForm();
    cy.get(`form[action="${MARKETO_SUBMIT}"] [type="submit"]`).click();

    cy.wait("@marketoSubmit");
    cy.location("pathname").should("eq", "/contact-us/error");
    cy.contains(
      "There was an error while sending your message. Please try again."
    );
    cy.window().then((win) => {
      const events = (win.dataLayer || []).map((entry) => entry.event);
      expect(events).to.include("contact_form_failed");
    });

    cy.contains("a", "Try again").click();
    cy.location("pathname").should("eq", "/contact-us");
    cy.get('input[name="firstName"]').should("have.value", "Test");
    cy.get('select[name="country"]').should("have.value", "NL");
    cy.get('textarea[name="Comments_from_lead__c"]').should(
      "have.value",
      "Hello"
    );
  });

  function sendFromLandingLink(consent) {
    cy.setCookie("_cookies_accepted", consent);
    mockUbuntuSubmit();
    cy.visit(
      "http://localhost:8045/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=ad1&utm_term=juju&gclid=g123&fbclid=f456"
    );
    cy.get("footer").contains("a", "Contact us").click();
    cy.get(".js-contact-modal").within(() => {
      fillForm();
      cy.get('[type="submit"]').click();
    });
    return cy
      .wait("@marketoSubmit")
      .then((interception) => new URLSearchParams(interception.request.body));
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

    cy.get("footer").contains("a", "Contact us").click();
    cy.location("pathname").should("eq", "/contact-us");

    fillForm();
    cy.get(`form[action="${MARKETO_SUBMIT}"] [type="submit"]`).click();

    cy.wait("@marketoSubmit");
    cy.location("pathname").should("eq", "/thank-you");
    cy.contains("Thanks for contacting us");
  });
});
