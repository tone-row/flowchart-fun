import { lazy, memo } from "react";
import { Route, RouteProps, Switch } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import Layout from "./Layout";
import Public from "./Public";
const Edit = lazy(() => import("./Edit"));
const EditUserChart = lazy(() => import("./EditUserChart"));
const ReadOnly = lazy(() => import("./ReadOnly"));

export default function Router() {
  usePageViews();
  return (
    <Switch>
      <LayoutRoute path="/" exact>
        <Edit />
      </LayoutRoute>
      <LayoutRoute path="/u/:id">
        <EditUserChart />
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
