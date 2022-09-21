import { lazy, memo } from "react";
import { Route, RouteProps, Switch } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import { New } from "../pages/New";
import Layout from "./Layout";
const Public = lazy(() => import("../pages/Public"));
const Edit = lazy(() => import("../pages/Edit"));
const Help = lazy(() => import("../pages/Help"));
const EditHosted = lazy(() => import("../pages/EditHosted"));
const ReadOnly = lazy(() => import("../pages/ReadOnly"));

export default function Router() {
  usePageViews();
  return (
    <Switch>
      <LayoutRoute path="/" exact>
        <Edit />
      </LayoutRoute>
      <LayoutRoute path="/h" exact>
        <Help />
      </LayoutRoute>
      <Route path="/n/:graphText?">
        <New />
      </Route>
      <LayoutRoute path="/u/:id">
        <EditHosted />
      </LayoutRoute>
      <LayoutRoute path="/r/:graphText?">
        <ReadOnly />
      </LayoutRoute>
      <LayoutRoute path="/c/:graphText?">
        <ReadOnly />
      </LayoutRoute>
      <LayoutRoute path="/f/:graphText?">
        <ReadOnly />
      </LayoutRoute>
      <LayoutRoute path="/p/:public_id">
        <Public />
      </LayoutRoute>
      <LayoutRoute path="/:workspace">
        <Edit />
      </LayoutRoute>
    </Switch>
  );
}

const LayoutRoute = memo(({ children, ...props }: RouteProps) => {
  return (
    <Route {...props}>
      <Layout>{children}</Layout>
    </Route>
  );
});

LayoutRoute.displayName = "LayoutRoute";
