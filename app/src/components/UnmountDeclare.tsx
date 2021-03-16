/* This is a component that declares when it unmounts
so that we can reliably show a loading screen before
the monaco editor is ready */

import { useContext, useEffect } from "react";
import { AppContext } from "./AppContext";

export default function UnmountDeclare() {
  const { setIsReady } = useContext(AppContext);
  useEffect(() => {
    return setIsReady;
  }, [setIsReady]);
  return null;
}
