import type { ReactNode } from "react";

type Props = {
  title: string;
  onClick: () => void;
  children: ReactNode;
};

function PaginationButton({ title, onClick, children }: Props) {
  return (
    <button
      type="button"
      className="p-button--base has-icon u-no-margin--bottom"
      aria-label={title}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default PaginationButton;
