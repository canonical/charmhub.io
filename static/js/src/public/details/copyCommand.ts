const init = () => {
  const button = document.querySelector(
    "[data-js='copy-deploy-command']"
  ) as HTMLButtonElement | null;
  const codeEl = document.getElementById("deploy-command");

  if (!button || !codeEl || !navigator.clipboard) {
    return;
  }

  button.addEventListener("click", async () => {
    const text = codeEl.textContent?.trim();

    if (!text) {
      return;
    }

    const icon = button.querySelector("i");
    if (!icon) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }

    icon.className = "p-icon--success";
    button.title = "Copied";
    button.setAttribute("aria-label", "Deploy command copied");

    window.setTimeout(() => {
      icon.className = "p-icon--copy";
      button.title = "Copy deploy command";
      button.setAttribute("aria-label", "Copy deploy command");
    }, 2000);
  });
};

export { init as copyCommand };
