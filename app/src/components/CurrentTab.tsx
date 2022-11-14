import { lazy, ReactNode, useContext } from "react";

import { AppContext } from "./AppContext";
const Settings = lazy(() => import("./Settings"));
const Navigation = lazy(() => import("./Navigation"));
const Feedback = lazy(() => import("./Feedback"));
const SponsorDashboard = lazy(() => import("./SponsorDashboard"));

export default function CurrentTab({ children }: { children: ReactNode }) {
  const { showing } = useContext(AppContext);
  switch (showing) {
    case "settings":
      return <Settings />;
    case "navigation":
      return <Navigation />;
    case "feedback":
      return <Feedback />;
    case "account":
      return <SponsorDashboard />;
    default:
      return <>{children}</>;
  }
}
