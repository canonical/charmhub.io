export default function setupLogin() {
  // Login
  const notAuthenticatedMenu = document.querySelector(
    ".js-nav-account--notauthenticated"
  ) as HTMLElement;
  const authenticatedMenu = document.querySelector(
    ".js-nav-account--authenticated"
  ) as HTMLElement;

  if (notAuthenticatedMenu && authenticatedMenu) {
    fetch("/account.json")
      .then((response) => response.json())
      .then((data) => {
        if (data.account) {
          const displayName = document.querySelector(
            ".js-account--name"
          ) as HTMLElement;

          notAuthenticatedMenu.classList.add("u-hide");
          authenticatedMenu.classList.remove("u-hide");
          displayName.innerHTML = data.account["display-name"];
        }
      });
  }
}
