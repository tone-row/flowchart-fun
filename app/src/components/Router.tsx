import { lazy } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
const Edit = lazy(() => import("./Edit"));
const ReadOnly = lazy(() => import("./ReadOnly"));

export default function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact>
          <Edit />
        </Route>
        <Route path="/r/:graphText">
          <ReadOnly />
        </Route>
        <Route path="/:workspace">
          <Edit />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
