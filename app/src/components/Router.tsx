import { lazy } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Layout from "./Layout";
const Edit = lazy(() => import("./Edit"));
const ReadOnly = lazy(() => import("./ReadOnly"));

export default function Router() {
  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route path="/" exact>
            <Edit />
          </Route>
          <Route path="/r/:graphText?">
            <ReadOnly />
          </Route>
          <Route path="/c/:graphText?">
            <ReadOnly compressed={true} />
          </Route>
          <Route path="/:workspace">
            <Edit />
          </Route>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}
