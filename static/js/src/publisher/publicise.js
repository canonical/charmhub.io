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

// EMBEDDABLE CARDS

const getCardPath = (packageName, options = {}) => {
  const path = `/${packageName}/embedded`;
  let params = [];

  if (options.button) {
    params.push(`button=${options.button}`);
  }

  if (options["show-channels"]) {
    params.push(`channels=true`);
  }

  if (options["show-summary"]) {
    params.push(`summary=true`);
  }

  if (options["show-base"]) {
    params.push(`base=true`);
  }

  if (params.length) {
    params = `?${params.join("&")}`;
  }

  return `${path}${params}`;
};

const getCardEmbedHTML = (packageName, options) => {
  return `&lt;iframe src="https://charmhub.io${getCardPath(
    packageName,
    options
  )}" frameborder="0" width="100%" height="${
    options.frameHeight
  }px" style="border: 1px solid #CCC; border-radius: 2px;"&gt;&lt;/iframe&gt;`;
};

// get form state from inputs
const getCurrentFormState = (buttonRadios, optionButtons) => {
  const state = {};

  // get state of store button radio
  let checked = buttonRadios.filter((b) => b.checked);
  if (checked.length > 0) {
    state.button = checked[0].value;
  }

  // get state of options checkboxes
  optionButtons.forEach((checkbox) => {
    state[checkbox.name] = checkbox.checked;
  });

  return state;
};
const initEmbeddedCardPicker = (options) => {
  const { packageName, previewFrame, codeElement } = options;
  const buttonRadios = [].slice.call(options.buttonRadios);
  const optionButtons = [].slice.call(options.optionButtons);

  let state = {
    ...getCurrentFormState(buttonRadios, optionButtons),
    frameHeight: 320,
  };

  const renderCode = (state) => {
    codeElement.innerHTML = getCardEmbedHTML(packageName, state);
  };

  const render = (state) => {
    previewFrame.src = getCardPath(packageName, state);
    renderCode(state);
  };

  const getFormState = () => {
    return getCurrentFormState(buttonRadios, optionButtons);
  };

  const updateState = () => {
    state = {
      ...state,
      ...getFormState(),
    };
    render(state);
  };

  buttonRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        updateState();
      }
    });
  });

  optionButtons.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateState();
    });
  });

  if (buttonRadios.length > 0) {
    buttonRadios.filter((r) => r.value === "black")[0].checked = true;
  }

  // update the frame (but only if it's visible)
  if (previewFrame.offsetParent !== null) {
    previewFrame.src = getCardPath(packageName, getFormState());
    codeElement.innerHTML = getCardEmbedHTML(packageName, getFormState());
  }

  const updateCardSize = () => {
    // calulate frame height to be a bit bigger then content itself
    // to have some spare room for responsiveness
    if (previewFrame.offsetParent) {
      const height =
        Math.floor(
          (previewFrame.contentWindow.document.body.clientHeight + 20) / 10
        ) * 10;

      if (height !== state.frameHeight) {
        state = {
          ...state,
          frameHeight: height,
        };
        // don't re-render the iframe not to trigger load again
        previewFrame.style.height = height + "px";

        if (options.updateHeightCallback) {
          options.updateHeightCallback(height);
        }
        renderCode(state);
      }
    } else {
      renderCode(state);
    }
  };

  previewFrame.addEventListener("load", updateCardSize);
  setInterval(updateCardSize, 1000);

  return () => render(state);
};

export { initSnapButtonsPicker, initEmbeddedCardPicker };
