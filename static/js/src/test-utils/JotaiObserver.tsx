import { useEffect } from "react";
import { useAtomValue } from "jotai";
import type { Atom } from "jotai";

function JotaiObserver({
  atom,
  event,
}: {
  atom: Atom<unknown>;
  event: (value: unknown) => void;
}) {
  const value = useAtomValue(atom);

  useEffect(() => {
    event(value);
  }, [event, value]);

  return null;
}

export default JotaiObserver;
