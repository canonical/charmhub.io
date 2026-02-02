import debounce from "../debounce";

describe("Debounce", () => {
  vi.useFakeTimers();

  test("should delay the function call by the specified wait time", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(199);
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalled();
  });

  test("should call the function immediately if immediate is true", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1, true);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should handle multiple calls and execute only once after the last call", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should correctly apply the context and arguments", () => {
    const mockFn = vi.fn(function (arg1, arg2) {
      expect(this.value).toBe(42);
      expect(arg1).toBe("hello");
      expect(arg2).toBe("world");
    });

    const debouncedFn = debounce(mockFn, 200, false);

    const context = { value: 42 };
    debouncedFn.apply(context, ["hello", "world"]);

    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalled();
  });

  test("should clear timeout when debounced.clear is called", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    debouncedFn();
    debouncedFn.clear();

    vi.advanceTimersByTime(200);
    expect(mockFn).not.toHaveBeenCalled();
  });

  test("should handle rapid consecutive calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    for (let i = 0; i < 10; i++) {
      debouncedFn();
    }

    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should call the function multiple times with immediate true", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, true);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  test("should handle multiple debounce instances independently", () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    const debouncedFn1 = debounce(mockFn1, 200, false);
    const debouncedFn2 = debounce(mockFn2, 200, false);

    debouncedFn1();
    debouncedFn2();

    vi.advanceTimersByTime(200);

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  test("should not call the function if called multiple times within wait time", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    debouncedFn();
    vi.advanceTimersByTime(100);
    debouncedFn();
    vi.advanceTimersByTime(100);
    debouncedFn();

    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should not call the function after clearing during wait period", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 200, false);

    debouncedFn();
    vi.advanceTimersByTime(100);
    debouncedFn.clear();
    vi.advanceTimersByTime(200);

    expect(mockFn).not.toHaveBeenCalled();
  });
});
