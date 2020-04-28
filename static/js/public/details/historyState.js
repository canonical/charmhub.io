class HistoryState {
  constructor() {
    this.path = window.location.hash.substr(1).split("/");
    this.popListeners = [];

    window.addEventListener("popstate", (e) => {
      this.popListeners.forEach((fn) => {
        fn(e.state);
      });
    });
  }

  updatePath(part, path) {
    if (part === 0) {
      this.path = path;
      if (!Array.isArray(this.path)) {
        this.path = [this.path];
      }
    } else {
      this.path[part] = path;
    }
    history.pushState(this.path, null, `#${this.path.join("/")}`);
  }

  addPopListener(fn) {
    this.popListeners.push(fn);
  }
}

export { HistoryState };
