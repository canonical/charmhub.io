import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

// Using any keeps hydration usable across atom shapes in tests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InitialValues = Array<readonly [any, any]>;

function HydrateAtoms({
  initialValues,
  children,
}: {
  initialValues: InitialValues;
  children: ReactNode;
}) {
  useHydrateAtoms(initialValues);
  return children;
}

function JotaiTestProvider({
  initialValues = [],
  children,
}: {
  initialValues?: InitialValues;
  children: ReactNode;
}) {
  return (
    <JotaiProvider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </JotaiProvider>
  );
}

export default JotaiTestProvider;
