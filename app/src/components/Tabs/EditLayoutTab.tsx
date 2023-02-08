import { t, Trans } from "@lingui/macro";
import produce from "immer";
import { FaRegSnowflake } from "react-icons/fa";

import { defaultLayout } from "../../lib/constants";
import { getLayout } from "../../lib/getLayout";
import { directions, layouts } from "../../lib/graphOptions";
import { hasOwnProperty } from "../../lib/helpers";
import { useIsValidSponsor } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import styles from "./EditLayoutTab.module.css";
import {
  CustomSelect,
  LargeLink,
  OptionWithLabel,
  Range,
  TabOptionsGrid,
  WithLowerChild,
} from "./shared";

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
    layouts.find((l) => l.value === layoutName)?.label() ?? "???";

  const frozen = useIsFrozen();
  // "positions" in rendered;

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
    directions.find((l) => l.value === direction)?.label() ?? "???";

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
        <OptionWithLabel label={t`Layout`}>
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
          <OptionWithLabel label={t`Direction`}>
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
        <OptionWithLabel label={t`Direction`}>
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
          <OptionWithLabel label={t`Spacing`}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="number"
                value={spacingFactor}
                step={0.1}
                min={0.25}
                className={styles.numberInput}
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
              <Range
                defaultValue={[defaultLayout.spacingFactor as number]}
                min={0.25}
                max={2}
                step={0.01}
                value={[spacingFactor || 0]}
                onValueChange={([value]) => {
                  useDoc.setState((state) => {
                    return produce(state, (draft) => {
                      if (!draft.meta.layout) draft.meta.layout = {};
                      // This any is because typing the layout object is too restrictive
                      (draft.meta.layout as any).spacingFactor = value;
                    });
                  });
                }}
              />
            </div>
          </OptionWithLabel>
        )}
      </TabOptionsGrid>
      {!isValidSponsor && (
        <LargeLink href="/sponsor">
          <Trans>Get More Layouts</Trans>
        </LargeLink>
      )}
    </WithLowerChild>
  );
}

export function unfreezeDoc() {
  useDoc.setState((state) => {
    return produce(state, (draft) => {
      delete draft.meta.nodePositions;
    });
  });
}

export function useIsFrozen() {
  const doc = useDoc();
  const rendered = getLayout(doc);
  const frozen = "positions" in rendered;

  return frozen;
}

function FrozenLayout() {
  return (
    <div className={styles.Frozen}>
      <h2>
        <span>
          <Trans>Layout is Frozen</Trans>
        </span>
        <FaRegSnowflake />
      </h2>
      <button onClick={unfreezeDoc}>
        <Trans>Unfreeze</Trans>
      </button>
    </div>
  );
}
