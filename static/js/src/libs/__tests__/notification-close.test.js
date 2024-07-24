import initCloseButton from "../notification-close";

describe("Notification close", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="p-notification" id="notification1">
        <button aria-controls="notification1" class="close-button">Close</button>
        <div>Notification 1</div>
      </div>
      <div class="p-notification" id="notification2">
        <button aria-controls="notification2" class="close-button">Close</button>
        <div>Notification 2</div>
      </div>
    `;

    initCloseButton();
  });

  test("should hide the notification when the close button is clicked", () => {
    const closeButton1 = document.querySelector("#notification1 .close-button");
    const notification1 = document.getElementById("notification1");

    expect(notification1.classList.contains("u-hide")).toBe(false);
    expect(closeButton1).not.toBeNull();

    closeButton1.click();

    expect(notification1.classList.contains("u-hide")).toBe(true);
  });

  test("should attach an event listener to each close button", () => {
    const closeButton1 = document.querySelector("#notification1 .close-button");
    const closeButton2 = document.querySelector("#notification2 .close-button");

    expect(closeButton1).not.toBeNull();
    expect(closeButton2).not.toBeNull();

    closeButton1.click();
    closeButton2.click();

    expect(
      document.getElementById("notification1").classList.contains("u-hide")
    ).toBe(true);

    expect(
      document.getElementById("notification2").classList.contains("u-hide")
    ).toBe(true);
  });

  test("should not throw errors when no close buttons are present", () => {
    document.body.innerHTML = "<div>No notifications</div>";

    initCloseButton();

    expect(true).toBe(true);
  });
});
