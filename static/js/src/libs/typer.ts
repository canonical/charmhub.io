interface Typer {
  element: HTMLElement;
  words: string[];
  delay: number;
  loop: number;
  deleteDelay: number;
  progress: { word: number; char: number; building: boolean; looped: number };
  typing: boolean;
  colors: string[];
  colorIndex: number;
  cursor?: Cursor;

  start(): void;
  stop(): void;
  doTyping(): void;
}

interface Cursor {
  element: HTMLElement;
  cursorDisplay: string;
  on: boolean;
  interval: number;
  owner?: Typer;

  updateBlinkState(): void;
}

function createTyper(element: HTMLElement): Typer {
  const delim = element.dataset.delim || ",";
  const words = element.dataset.words || "override these,sample typing";
  const typer: Typer = {
    element: element,
    words: words.split(delim).filter((v) => v), // non-empty words
    delay: parseInt(element.dataset.delay || "200", 10),
    loop: parseInt(element.dataset.loop || "1", 10),
    deleteDelay: parseInt(
      element.dataset.deletedelay || element.dataset.deleteDelay || "800",
      10
    ),
    progress: { word: 0, char: 0, building: true, looped: 0 },
    typing: true,
    colors: (element.dataset.colors || "black").split(","),
    colorIndex: 0,

    start() {
      if (!typer.typing) {
        typer.typing = true;
        typer.doTyping();
      }
    },

    stop() {
      typer.typing = false;
    },

    doTyping() {
      const e = typer.element;
      const p = typer.progress;
      const w = p.word;
      const c = p.char;
      const currentDisplay = [...typer.words[w]].slice(0, c).join("");
      let atWordEnd: boolean = false;
      if (typer.cursor) {
        typer.cursor.element.style.opacity = "1";
        typer.cursor.on = true;
        clearInterval(typer.cursor.interval);
        typer.cursor.interval = window.setInterval(
          () => typer.cursor?.updateBlinkState(),
          400
        );
      }

      e.innerHTML = currentDisplay;

      if (p.building) {
        atWordEnd = p.char === typer.words[w].length;
        if (atWordEnd) {
          p.building = false;
        } else {
          p.char += 1;
        }
      } else {
        if (p.char === 0) {
          p.building = true;
          p.word = (p.word + 1) % typer.words.length;
          typer.colorIndex = (typer.colorIndex + 1) % typer.colors.length;
          typer.element.style.color = typer.colors[typer.colorIndex];
        } else {
          p.char -= 1;
        }
      }

      if (p.word === typer.words.length - 1) {
        p.looped += 1;
      }

      if (!p.building && typer.loop <= p.looped) {
        typer.typing = false;
      }

      let randomDelay = typer.delay;
      if (p.building) {
        randomDelay =
          typer.delay +
          Math.floor(Math.random() * 2 * typer.delay);
      }

      if (typer.words[w][c] === "") {
        randomDelay = 0;
      }

      window.setTimeout(
        () => {
          if (typer.typing) {
            typer.doTyping();
          }
        },
        atWordEnd ? typer.deleteDelay : randomDelay
      );
    },
  };

  const colors = typer.colors;
  typer.element.style.color = colors[0];

  return typer;
}

function TyperSetup() {
  const typers: { [key: string]: Typer } = {};
  const typerElements = document.getElementsByClassName("typer");
  for (let i = 0; i < typerElements.length; i++) {
    const e = typerElements[i] as HTMLElement;
    typers[e.id] = createTyper(e);
  }

  const stopElements = document.getElementsByClassName("typer-stop");
  for (let i = 0; i < stopElements.length; i++) {
    const e = stopElements[i] as HTMLElement;
    const owner = typers[e.dataset.owner as string];
    e.onclick = () => owner.stop();
  }

  const startElements = document.getElementsByClassName("typer-start");
  for (let i = 0; i < startElements.length; i++) {
    const e = startElements[i] as HTMLElement;
    const owner = typers[e.dataset.owner as string];
    e.onclick = () => owner.start();
  }

  const cursorElements = document.getElementsByClassName("cursor");
  for (let i = 0; i < cursorElements.length; i++) {
    const e = cursorElements[i] as HTMLElement;
    const t: Cursor = {
      element: e,
      cursorDisplay: e.dataset.cursordisplay || e.dataset.cursorDisplay || "_",
      on: true,
      interval: window.setInterval(() => updateBlinkState(t), 400),
      updateBlinkState() {
        if (t.on) {
          t.element.style.opacity = "0";
          t.on = false;
        } else {
          t.element.style.opacity = "1";
          t.on = true;
        }
      }
    };
    const owner = typers[e.dataset.owner as string];
    if (owner) {
      owner.cursor = t;
    }
  }
}

function updateBlinkState(cursor: Cursor) {
  if (cursor.on) {
    cursor.element.style.opacity = "0";
    cursor.on = false;
  } else {
    cursor.element.style.opacity = "1";
    cursor.on = true;
  }
}

TyperSetup();
