import { lazy, memo } from "react";
import { BrowserRouter, Route, RouteProps, Switch } from "react-router-dom";
import Layout from "./Layout";
const Edit = lazy(() => import("./Edit"));
const ReadOnly = lazy(() => import("./ReadOnly"));

export default function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <LayoutRoute path="/" exact>
          <Edit />
        </LayoutRoute>
        <LayoutRoute path="/r/:graphText?">
          <ReadOnly />
        </LayoutRoute>
        <LayoutRoute path="/c/:graphText?">
          <ReadOnly compressed={true} />
        </LayoutRoute>
        <LayoutRoute path="/f/:graphText?">
          <ReadOnly compressed={true} />
        </LayoutRoute>
        <LayoutRoute path="/:workspace">
          <Edit />
        </LayoutRoute>
      </Switch>
    </BrowserRouter>
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
