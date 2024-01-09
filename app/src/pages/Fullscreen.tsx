import { useQuery } from "react-query";
import Graph from "../components/Graph";
import { useLocation, useParams } from "react-router-dom";
import { loadReadOnly } from "./ReadOnly";

export default function Fullscreen() {
  const { pathname } = useLocation();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  useQuery(
    ["read", pathname, graphText],
    () => loadReadOnly(pathname, graphText),
    {
      enabled: typeof graphText === "string",
      suspense: true,
      staleTime: 0,
    }
  );
  return <Graph shouldResize={0} />;
}
