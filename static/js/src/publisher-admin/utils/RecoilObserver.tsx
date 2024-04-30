import { useEffect } from "react";
import { useRecoilValue } from "recoil";

const RecoilObserver = ({ node, event }: { node: any; event: Function }) => {
  const value = useRecoilValue(node);

  useEffect(() => {
    event(value);
  }, [event, value]);

  return null;
};

export default RecoilObserver;
