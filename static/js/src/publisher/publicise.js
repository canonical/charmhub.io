const initSnapButtonsPicker = (
  dropDownSelector,
  languageSectionListSelector
) => {
  const languagePicker = document.querySelector(dropDownSelector);
  const languageSectionList = document.querySelectorAll(
    languageSectionListSelector
  );

  const showLanguage = (language) => {
    const open = document.querySelector(`#${language}-content`);

    const notHidden = document.querySelector(
      `${languageSectionListSelector}:not(.u-hide)`
    );
    if (notHidden) {
      notHidden.classList.add("u-hide");
    }
    if (open) {
      open.classList.remove("u-hide");
    }
  };

  if (languagePicker && languageSectionList) {
    showLanguage(languagePicker.value);

    languagePicker.addEventListener("change", (e) => {
      showLanguage(e.target.value);
    });
  } else {
    throw new Error(
      `There are no elements containing ${
        languageSectionList ? dropDownSelector : languageSectionListSelector
      } selector.`
    );
  }
};

export { initSnapButtonsPicker };
