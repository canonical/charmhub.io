document.addEventListener("DOMContentLoaded", () => {
  const selectElement = document.getElementById(
    "version-select"
  ) as HTMLSelectElement | null;

  if (!selectElement) return;

  selectElement.addEventListener("change", () => {
    const url = selectElement.value.trim();

    if (!url) return;

    try {
      const parsedUrl = new URL(url, window.location.origin);

      // Allow only URLs starting with "http", "https", or "/"
      if (/^(https?:\/\/|\/)/.test(parsedUrl.href)) {
        window.location.href = parsedUrl.href;
      } else {
        console.error("Blocked unsafe redirect:", parsedUrl.href);
      }
    } catch (error) {
      console.error("Failed to parse URL:", url, error);
    }
  });
});
