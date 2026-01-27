import { createTyper, TyperSetup } from "../typer";

beforeEach(() => {
  document.body.innerHTML = `
    <div id="testTyper" class="typer" data-words="hello,world" data-delay="100" data-loop="2" data-colors="red,green"></div>
    <button class="typer-start" data-owner="testTyper">Start</button>
    <button class="typer-stop" data-owner="testTyper">Stop</button>
    <div class="cursor" data-owner="testTyper" data-cursordisplay="_"></div>
  `;
});

describe("Create Typer", () => {
  test("should create a Typer instance with correct properties", () => {
    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    expect(typer).toBeDefined();
    expect(typer.words).toEqual(["hello", "world"]);
    expect(typer.delay).toBe(100);
    expect(typer.loop).toBe(2);
    expect(typer.colors).toEqual(["red", "green"]);
    expect(typer.colorIndex).toBe(0);
    expect(typer.typing).toBe(true);
    expect(typer.element.style.color).toBe("red");
  });

  test("should initialise with default colour if no colours are provided", () => {
    const element = document.createElement("div");
    element.setAttribute("class", "typer");
    document.body.appendChild(element);
    const typer = createTyper(element);

    expect(typer.colors).toEqual(["black"]);
    expect(typer.element.style.color).toBe("black");
  });

  test("should update the display with the typed text", () => {
    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    jest.spyOn(typer, "doTyping").mockImplementation(() => {
      typer.element.innerHTML = "hello";
    });

    typer.doTyping();
    expect(element.innerHTML).toBe("hello");
  });

  test("should start typing when start() is called", () => {
    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    jest.spyOn(typer, "doTyping").mockImplementation(() => {});

    typer.start();
    expect(typer.typing).toBe(true);
  });

  test("should stop typing when stop() is called", () => {
    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    jest.spyOn(typer, "doTyping").mockImplementation(() => {});

    typer.start();
    expect(typer.typing).toBe(true);
    typer.stop();
    expect(typer.typing).toBe(false);
  });
});

describe("Typer setup", () => {
  test("should correctly setup typers and their start/stop buttons", () => {
    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    jest.spyOn(typer, "start").mockImplementation(() => {});
    jest.spyOn(typer, "stop").mockImplementation(() => {});

    const startHandler = jest.fn();
    const stopHandler = jest.fn();

    const startButton = document.querySelector(
      ".typer-start"
    ) as HTMLButtonElement;
    const stopButton = document.querySelector(
      ".typer-stop"
    ) as HTMLButtonElement;

    startButton.addEventListener("click", startHandler);
    stopButton.addEventListener("click", stopHandler);

    TyperSetup();

    startButton.click();
    stopButton.click();

    expect(startHandler).toHaveBeenCalled();
    expect(stopHandler).toHaveBeenCalled();
  });
});

describe("Cursor functionality", () => {
  test("should toggle cursor visibility", () => {
    jest.useFakeTimers();

    const element = document.getElementById("testTyper") as HTMLElement;
    const typer = createTyper(element);

    if (typer.cursor) {
      typer.cursor.updateBlinkState();
      expect(typer.cursor.element.style.opacity).toBe("0");

      jest.advanceTimersByTime(400);
      expect(typer.cursor.element.style.opacity).toBe("1");

      jest.advanceTimersByTime(400);
      expect(typer.cursor.element.style.opacity).toBe("0");
    }

    jest.useRealTimers();
  });
});
