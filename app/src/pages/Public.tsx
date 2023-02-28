import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { CloneButton } from "../components/CloneButton";
import Graph from "../components/Graph";
import GraphWrapper from "../components/GraphWrapper";
import styles from "../components/Main.module.css";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { getPublicChart } from "../lib/queries";
import { useDetailsStore } from "../lib/useDoc";

const shouldResize = 0;

function Public() {
  const { public_id } = useParams<{ public_id: string }>();
  useQuery(["useHostedDoc", public_id], () => loadPublicDoc(public_id), {
    enabled: typeof public_id === "string",
    suspense: true,
  });
  return (
    <GraphWrapper boxProps={{ style: { height: "100%" } }}>
      <Graph shouldResize={shouldResize} />
      <div className={styles.CopyButtonWrapper}>
        <CloneButton />
      </div>
    </GraphWrapper>
  );
}

export default Public;

async function loadPublicDoc(id: string) {
  const chart = await getPublicChart(id);
  if (!chart) throw new Error("Chart not found");
  const doc = chart.chart;
  prepareChart(doc);
  useDetailsStore.setState({
    isHosted: true,
    title: doc.name,
    id: doc.id,
  });
  return doc;
}
