import { lazy, ReactNode, useContext, useMemo } from "react";
import { AppContext } from "./AppContext";
const Share = lazy(() => import("./Share"));
const Settings = lazy(() => import("./Settings"));
const Navigation = lazy(() => import("./Navigation"));
const Feedback = lazy(() => import("./Feedback"));

export default function CurrentTab({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const child = useMemo(() => {
    return showing === "editor" ? (
      children
    ) : showing === "settings" ? (
      <Settings />
    ) : showing === "share" ? (
      <Share />
    ) : showing === "navigation" ? (
      <Navigation />
    ) : showing === "feedback" ? (
      <Feedback />
    ) : (
      showing
    );
  }, [children, showing]);
  return <>{child}</>;
}
