import { lazy, ReactNode } from "react";
import { Route, RouteProps, Switch } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import { LogIn } from "../pages/LogIn";
import { New } from "../pages/New";
import { SignUp } from "../pages/SignUp";
import Feedback from "./Feedback";
import Layout from "./Layout";
import Settings from "./Settings";
import SponsorDashboard from "./SponsorDashboard";
/** Public view of hosted chart (permalink), readonly */
const Public = lazy(() => import("../pages/Public"));
/** Edit charts in local storage */
const Edit = lazy(() => import("../pages/Edit"));
/** Interactive help, fixed name local storage chart */
const Help = lazy(() => import("../pages/Help"));
/** Edit hosted chart */
const EditHosted = lazy(() => import("../pages/EditHosted"));
/** Read only chart, encoded in url / maybe fullscreen */
const ReadOnly = lazy(() => import("../pages/ReadOnly"));
const Charts = lazy(() => import("../pages/Charts"));
const Sponsor = lazy(() => import("../pages/Sponsor"));

export default function Router() {
  usePageViews();
  return (
    <Switch>
      <RouteWithWrapper path="/" exact>
        <Edit />
      </RouteWithWrapper>
      <RouteWithWrapper path="/sponsor" exact>
        <Sponsor />
      </RouteWithWrapper>
      {/* "y" for "your charts" */}
      <RouteWithWrapper path="/y" exact>
        <Charts />
      </RouteWithWrapper>
      <RouteWithWrapper path="/h" exact>
        <Help />
      </RouteWithWrapper>
      <RouteWithWrapper path="/n/:graphText?">
        <New />
      </RouteWithWrapper>
      <RouteWithWrapper path="/u/:id">
        <EditHosted />
      </RouteWithWrapper>
      <RouteWithWrapper path="/r/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      {/* c for "compressed" */}
      <RouteWithWrapper path="/c/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      <RouteWithWrapper path="/f/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      <Route path="/p/:public_id">
        <Public />
      </Route>
      <RouteWithWrapper path="/s">
        <Settings />
      </RouteWithWrapper>
      {/* "o" for no reason at all */}
      <RouteWithWrapper path="/o">
        <Feedback />
      </RouteWithWrapper>
      <RouteWithWrapper path="/a">
        <SponsorDashboard />
      </RouteWithWrapper>
      {/* "i" for s-"i"-gn up */}
      <RouteWithWrapper path="/i">
        <SignUp />
      </RouteWithWrapper>
      {/* "l" for login */}
      <RouteWithWrapper path="/l">
        <LogIn />
      </RouteWithWrapper>
      <RouteWithWrapper path="/:workspace">
        <Edit />
      </RouteWithWrapper>
    </Switch>
  );
}

/** Adds the share dialog. Could probably be in a better spot */
function RouteWrapper({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

function RouteWithWrapper({
  children,
  ...rest
}: {
  children: ReactNode;
} & RouteProps) {
  return (
    <Route {...rest}>
      <RouteWrapper>{children}</RouteWrapper>
    </Route>
  );
}
