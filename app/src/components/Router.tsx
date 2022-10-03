import { lazy } from "react";
import { Route, Switch } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import { New } from "../pages/New";
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

export default function Router() {
  usePageViews();
  return (
    <Switch>
      <Route path="/" exact>
        <Edit />
      </Route>
      <Route path="/h" exact>
        <Help />
      </Route>
      <Route path="/n/:graphText?">
        <New />
      </Route>
      <Route path="/u/:id">
        <EditHosted />
      </Route>
      <Route path="/r/:graphText?">
        <ReadOnly />
      </Route>
      <Route path="/c/:graphText?">
        <ReadOnly />
      </Route>
      <Route path="/f/:graphText?">
        <ReadOnly />
      </Route>
      <Route path="/p/:public_id">
        <Public />
      </Route>
      <Route path="/:workspace">
        <Edit />
      </Route>
    </Switch>
  );
}
