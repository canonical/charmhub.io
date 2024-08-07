import { useEffect } from "react";
import { RecoilValue, useRecoilValue } from "recoil";

const RecoilObserver = ({
  node,
  event,
}: {
  node: RecoilValue<unknown>;
  event: (value: unknown) => void;
}) => {
  const value = useRecoilValue(node);

  useEffect(() => {
    event(value);
  }, [event, value]);

  return null;
};

export default RecoilObserver;
