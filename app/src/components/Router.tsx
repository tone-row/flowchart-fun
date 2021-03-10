import { BrowserRouter, Route, Switch } from "react-router-dom";
import Edit from "./Edit";
import ReadOnly from "./ReadOnly";

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
