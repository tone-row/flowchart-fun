import produce from "immer";
import { FaRegSnowflake } from "react-icons/fa";

import { defaultLayout } from "../../lib/constants";
import { getLayout } from "../../lib/getLayout";
import { directions, layouts } from "../../lib/graphOptions";
import { hasOwnProperty } from "../../lib/helpers";
import { useIsValidSponsor } from "../../lib/hooks";
import { useDoc } from "../../lib/prepareChart";
import styles from "./EditLayoutTab.module.css";
import {
  CustomSelect,
  LargeLink,
  OptionWithLabel,
  TabOptionsGrid,
  WithLowerChild,
} from "./shared";
// directions

export function EditLayoutTab() {
  const isValidSponsor = useIsValidSponsor();
  const doc = useDoc();
  // the layout here is what we're rendering but not necessarily what should be stored in the doc
  const rendered = getLayout(doc);
  const layout = hasOwnProperty(doc.meta, "layout") ? doc.meta.layout : {};

  let layoutName = defaultLayout.name as string;
  if (
    typeof layout === "object" &&
    layout &&
    hasOwnProperty(layout, "name") &&
    typeof layout.name === "string"
  ) {
    layoutName = layout.name;
  }
  const layoutNiceName =
    layouts.find((l) => l.value === layoutName)?.label() ?? "Unknown";

  const frozen = "positions" in rendered;

  let direction = defaultLayout.rankDir;
  if (
    typeof layout === "object" &&
    layout &&
    hasOwnProperty(layout, "rankDir") &&
    typeof layout.rankDir === "string"
  ) {
    direction = layout.rankDir;
  }
  const directionNiceName =
    directions.find((l) => l.value === direction)?.label() ?? "Unknown";

  let spacingFactor = defaultLayout.spacingFactor;
  if (
    typeof layout === "object" &&
    layout &&
    hasOwnProperty(layout, "spacingFactor") &&
    typeof layout.spacingFactor === "number"
  ) {
    spacingFactor = layout.spacingFactor;
  }

  if (frozen) return <FrozenLayout />;

  return (
    <WithLowerChild>
      <TabOptionsGrid>
        <OptionWithLabel label="Layout">
          <CustomSelect
            niceName={layoutNiceName}
            options={layouts}
            value={layoutName}
            onValueChange={(name) => {
              useDoc.setState((state) => {
                return produce(state, (draft) => {
                  if (!draft.meta.layout) draft.meta.layout = {};
                  // This any is because typing the layout object is too restrictive
                  (draft.meta.layout as any).name = name;
                  delete draft.meta.nodePositions;
                });
              });
            }}
          />
        </OptionWithLabel>
        {["dagre"].includes(layoutName) && (
          <OptionWithLabel label="Direction">
            <CustomSelect
              niceName={directionNiceName}
              options={directions}
              value={direction}
              onValueChange={(direction) => {
                useDoc.setState((state) => {
                  return produce(state, (draft) => {
                    if (!draft.meta.layout) draft.meta.layout = {};
                    // This any is because typing the layout object is too restrictive
                    (draft.meta.layout as any).rankDir = direction;
                    delete draft.meta.nodePositions;
                  });
                });
              }}
            />
          </OptionWithLabel>
        )}
        {/* {/^elk-/.test(layoutName) && (
        <OptionWithLabel label="Direction">
          <CustomSelect
            niceName={directionNiceName}
      )} */}
        {[
          "dagre",
          "klay",
          "breadthfirst",
          "concentric",
          "circle",
          "grid",
          "elk-box",
          "elk-force",
          "elk-layered",
          "elk-mrtree",
          "elk-stress",
        ].includes(layoutName) && (
          <OptionWithLabel label="Spacing">
            <input
              type="range"
              min={0.25}
              max={2}
              step={0.01}
              value={spacingFactor}
              onChange={(e) => {
                useDoc.setState((state) => {
                  return produce(state, (draft) => {
                    if (!draft.meta.layout) draft.meta.layout = {};
                    // This any is because typing the layout object is too restrictive
                    (draft.meta.layout as any).spacingFactor = parseFloat(
                      e.target.value
                    );
                  });
                });
              }}
            />
            <span>{spacingFactor}</span>
          </OptionWithLabel>
        )}
      </TabOptionsGrid>
      {!isValidSponsor && (
        <LargeLink href="/sponsor">Get More Layouts</LargeLink>
      )}
    </WithLowerChild>
  );
}

function FrozenLayout() {
  return (
    <div className={styles.Frozen}>
      <h2>
        <span>Layout is Frozen</span>
        <FaRegSnowflake />
      </h2>
      <button
        onClick={() => {
          useDoc.setState((state) => {
            return produce(state, (draft) => {
              delete draft.meta.nodePositions;
            });
          });
        }}
      >
        Unfreeze
      </button>
    </div>
  );
}
