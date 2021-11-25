import { lazy, ReactNode, useContext, useMemo } from "react";

import { AppContext } from "./AppContext";
const Settings = lazy(() => import("./Settings"));
const Navigation = lazy(() => import("./Navigation"));
const Feedback = lazy(() => import("./Feedback"));
const Sponsor = lazy(() => import("./Sponsor"));

export default function CurrentTab({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  const child = useMemo(() => {
    return showing === "editor" ? (
      children
    ) : showing === "settings" ? (
      <Settings />
    ) : showing === "navigation" ? (
      <Navigation />
    ) : showing === "feedback" ? (
      <Feedback />
    ) : showing === "sponsor" ? (
      <Sponsor />
    ) : (
      showing
    );
  }, [children, showing]);
  return <>{child}</>;
}
