import React from "react";
import PropTypes from "prop-types";
import { createRoot } from "react-dom/client";

type MultiSelectProps = {
  value: string[];
  values: { name: string; key: string }[];
  updateHandler: (values: { name: string; key: string }[]) => void;
};

type MultiSelectState = {
  selected: { name: string; key: string }[];
  values: { name: string; key: string }[];
  searchTerm: string;
  searchResults: { name: string; key: string }[];
  showSearch: boolean;
  highlightedOption: number;
};

class MultiSelect extends React.Component<MultiSelectProps, MultiSelectState> {
  searchInput: HTMLInputElement;
  wrapperEl: HTMLElement;

  static propTypes: {
    value: PropTypes.Requireable<string[]>;
    values: PropTypes.Requireable<{ name: string; key: string }[]>;
    updateHandler: PropTypes.Requireable<
      (...args: { name: string; key: string }[]) => void
    >;
  };
  constructor(props: MultiSelectProps) {
    super(props);

    // The available values should be the full list minus the current values
    // sorted by name
    const values = this.props.values
      .filter((value) => !this.props.value.includes(value.key))
      .sort(this.sortByName);

    this.state = {
      // Get the correct objects for the currentValues as selected
      selected: this.props.values.filter((value) =>
        this.props.value.includes(value.key)
      ),
      values: values,
      searchTerm: "",
      searchResults: values,
      showSearch: false,
      highlightedOption: 0,
    };

    // Bind all the things
    // Clicking outside the component should hide the dropdown
    this.blur = this.blur.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.clickItem = this.clickItem.bind(this);
    this.addItem = this.addItem.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.search = this.search.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.clearAll = this.clearAll.bind(this);
  }

  sortByName(a: { name: string }, b: { name: string }) {
    return a.name.localeCompare(b.name);
  }

  /**
   * Remove an item from the 'selected' list.
   * Add it back into the 'values' list.
   */
  removeItem(key: string) {
    const toRemove = this.state.selected.filter((item) => item.key === key)[0];
    const newValues = this.state.values.slice(0);
    newValues.push(toRemove);
    newValues.sort(this.sortByName);
    const newSelected = this.state.selected.filter((item) => item.key !== key);

    this.setState(
      {
        values: newValues,
        selected: newSelected,
        // Preserve the filtered list in the dropdown
        searchResults: this.filterByTerm(newValues),
      },
      this.props.updateHandler.bind(this, this.state.selected)
    );
  }

  /**
   * If an element is clicked, remove the highlightedOption before adding
   * the item to the 'selected' list.
   *
   * @param key
   */
  clickItem(key: string) {
    this.setState({
      highlightedOption: 0,
    });
    this.addItem(key);
  }

  /**
   * Add an item to the 'selected' list.
   * Remove it from the 'values' list.
   */
  addItem(key: string) {
    // Get the object based on the key
    const toAdd = this.state.values.filter((item) => item.key === key)[0];
    const newSelected = this.state.selected.slice(0);
    newSelected.push(toAdd);
    const newValues = this.state.values.filter((item) => item.key !== key);
    this.searchInput.value = "";

    this.setState(
      {
        values: newValues,
        selected: newSelected,
        searchTerm: "",
        // Preserve the filtered list in the dropdown
        searchResults: newValues,
      },
      this.props.updateHandler.bind(this, this.state.selected)
    );
  }

  /**
   * Filter a list by term
   *
   * @param values
   * @param searchTerm
   * @returns {{name: string, key: string}[]}
   */
  filterByTerm(
    values: { name: string; key: string }[],
    searchTerm: string = this.state.searchTerm
  ) {
    searchTerm = searchTerm || this.state.searchTerm;
    return values.filter(
      (item) =>
        item.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        item.key.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
  }

  /**
   * Filter the 'values' list by the search term.
   */
  search(e: React.KeyboardEvent<HTMLInputElement>) {
    const searchTerm = (e.target as HTMLInputElement).value;
    const searchResults = this.filterByTerm(this.state.values, searchTerm);
    let highlighted = this.state.highlightedOption;
    if (!highlighted || highlighted < 0) {
      highlighted = 0;
    } else if (highlighted > searchResults.length - 1) {
      highlighted = searchResults.length - 1;
    }

    this.setState({
      searchResults: searchResults,
      searchTerm: searchTerm,
      showSearch: true,
      highlightedOption: highlighted,
    });
  }

  /**
   * Focus on the input
   */
  focusInput() {
    this.searchInput.focus();
    this.setState({
      showSearch: true,
      highlightedOption: this.state.highlightedOption,
    });
  }

  /**
   * Navigate the component with the keyboard.
   *
   * @param event
   */
  handleKeypress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (this.state.showSearch) {
      let highlighted = this.state.highlightedOption || 0;
      const results = this.state.searchResults;

      switch (event.key) {
        case "ArrowDown":
          if (highlighted === null) {
            highlighted = 0;
          } else {
            highlighted += 1;
          }
          break;
        case "ArrowUp":
          if (highlighted > 0) {
            highlighted -= 1;
          }
          break;
        case "Enter":
          event.preventDefault();
          if (highlighted >= 0) {
            this.addItem(results[highlighted].key);
          }
          break;
        case "Backspace":
          if (this.state.selected.length > 0 && this.state.searchTerm === "") {
            this.removeItem(
              this.state.selected[this.state.selected.length - 1].key
            );
          }
          break;
        case "Tab":
          this.blur();
          highlighted = 0;
          break;
        default:
          break;
      }

      if (highlighted < 0) {
        highlighted = 0;
      }

      if (highlighted > results.length - 1) {
        highlighted = results.length - 1;
      }

      this.setState({
        highlightedOption: highlighted,
      });
    }
  }

  /**
   * Clear all selected values
   */
  clearAll() {
    const toRemove = this.state.selected.slice(0);
    let newValues = this.state.values.slice(0);
    newValues = newValues.concat(toRemove);
    newValues.sort(this.sortByName);

    this.setState(
      {
        values: newValues,
        selected: [],
        // Preserve the filtered list in the dropdown
        searchResults: newValues,
      },
      () => {
        this.props.updateHandler.bind(this, this.state.selected);
        this.focusInput();
      }
    );
  }

  blur() {
    this.setState({
      showSearch: false,
      highlightedOption: 0,
    });

    this.props.updateHandler(this.state.selected);
  }

  /**
   * When clicking outside the component, blur the component
   * and update the original input
   *
   * @param event
   */
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.state.showSearch) {
      if (this.wrapperEl && !this.wrapperEl.contains(target)) {
        this.blur();
      }
    }
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  /**
   * Update the scroll position of the dropdown when
   * using the arrow keys to scroll
   */
  componentDidUpdate() {
    if (this.wrapperEl) {
      const optionsHolder = this.wrapperEl.querySelector(
        ".p-multiselect__options"
      );
      const selected = this.wrapperEl.querySelector(
        ".p-multiselect__option.is-highlighted"
      ) as HTMLElement;
      if (optionsHolder && selected) {
        const selectedTop = selected.offsetTop;
        const selectedHeight = selected.clientHeight;
        const selectedBottom = selectedTop + selectedHeight;
        const optionsHeight = optionsHolder.clientHeight;
        const optionsScroll = optionsHolder.scrollTop;
        const scrollBottom = optionsHeight + optionsScroll;
        if (selectedBottom > scrollBottom) {
          optionsHolder.scrollTop =
            optionsScroll + selectedBottom - scrollBottom;
        }
        if (selectedTop < optionsScroll) {
          optionsHolder.scrollTop = selectedTop;
        }
      }
    }
  }

  renderClear() {
    if (this.state.selected.length > 3 && this.state.showSearch) {
      return (
        <a className="p-multiselect__clear" onClick={this.clearAll}>
          Clear all
        </a>
      );
    } else {
      return null;
    }
  }

  renderSearch() {
    if (this.state.showSearch) {
      return (
        <ul className="p-multiselect__options">
          {this.state.searchResults.map((item, i) => (
            <li
              className={`p-multiselect__option${
                this.state.highlightedOption === i ? " is-highlighted" : ""
              }`}
              data-key={item.key}
              key={item.key}
              onClick={this.clickItem.bind(this, item.key)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      );
    }
    return false;
  }

  renderItems() {
    const items = this.state.selected.map((value) => (
      <span
        className="p-multiselect__item"
        data-key={value.key}
        key={value.key}
      >
        {value.name}
        <i
          className="p-icon--close p-multiselect__item-remove"
          onClick={this.removeItem.bind(this, value.key)}
        />
      </span>
    ));

    return items;
  }

  renderInput() {
    return (
      <input
        type="text"
        className="p-multiselect__input"
        onKeyUp={this.search}
        ref={(input) => {
          this.searchInput = input as HTMLInputElement;
        }}
      />
    );
  }

  render() {
    return (
      <div
        ref={(el) => {
          this.wrapperEl = el as HTMLElement;
        }}
      >
        {this.renderClear()}
        <div
          className={`p-multiselect${
            this.state.showSearch ? " is-focused" : ""
          }`}
          onClick={this.focusInput}
          onKeyDown={this.handleKeypress}
        >
          {this.renderItems()}
          {this.renderInput()}
          {this.renderSearch()}
        </div>
      </div>
    );
  }
}

MultiSelect.propTypes = {
  value: PropTypes.array,
  values: PropTypes.array,
  updateHandler: PropTypes.func,
};

/**
 * Update the original input value and dispatch a change event to the input and form.
 */
function updateHandler(input: HTMLInputElement, delimiter: string) {
  const _input = input;
  const _delimiter = delimiter;
  return function (values: { key: string }[]) {
    _input.value = values.map((item) => item.key).join(_delimiter);
    const changeEvent = new Event("change", { bubbles: true });

    _input.dispatchEvent(changeEvent);
  };
}

/**
 * Initialize the component if used outside of a react app
 *
 * Selector should be in the following format:
 * <div class="selector">
 *   <input type="text" class="js-multiselect-input" name="" value="" />
 *   <div class="js-multiselect-holder"></div>
 * </div>
 *
 * @param {HTMLElement} selector
 * @param {{name: string, key: string}[]} values
 * @param {String} delimiter
 */
function init(
  selector: string,
  values: { name: string; key: string }[],
  delimiter = ","
) {
  const el = document.querySelector(selector);

  if (el) {
    const holder = el.querySelector(".js-multiselect-holder") as HTMLElement;
    const input = el.querySelector(".js-multiselect-input") as HTMLInputElement;

    // hide the original input
    input.style.display = "none";

    // If there's anything in the current input, use it
    // split a list of , seperated strings to an array
    let currentValue = input.value.split(delimiter);

    // If a currentValue exists, trim the whitespace
    if (currentValue.length > 0) {
      currentValue = currentValue.map((val) => val.trim());
    } else {
      currentValue = [];
    }

    // do the react
    createRoot(holder).render(
      <MultiSelect
        value={currentValue}
        values={values}
        updateHandler={updateHandler(input, delimiter)}
      />
    );
  }
}

export { MultiSelect as default, init as initMultiselect };
