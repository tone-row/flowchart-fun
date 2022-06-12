import { useContext } from "react";
import { useHistory } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import { randomChartName } from "../lib/helpers";

export function New() {
  const { push } = useHistory();
  const { setShowing } = useContext(AppContext);
  push(`/${randomChartName()}`);
  setShowing("editor");
  return null;
}
