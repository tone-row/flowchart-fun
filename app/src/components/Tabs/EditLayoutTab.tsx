import { t, Trans } from "@lingui/macro";
import { FaRegSnowflake } from "react-icons/fa";

import { GraphOptionsObject } from "../../lib/constants";
import { setMetaImmer, useSafeDoc } from "../../lib/docHelpers";
import { defaultLayout, getLayout } from "../../lib/getLayout";
import { directions, layouts } from "../../lib/graphOptions";
import { hasOwnProperty } from "../../lib/helpers";
import { useIsValidSponsor } from "../../lib/hooks";
import { unfreezeDoc, useIsFrozen } from "../../lib/useIsFrozen";
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
  const doc = useSafeDoc();
  const layout = (
    hasOwnProperty(doc.meta, "layout") ? doc.meta.layout : {}
  ) as GraphOptionsObject["layout"];
  // this is the layout that's currently being rendered
  const graphLayout = getLayout(doc);

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

  const isFrozen = useIsFrozen();

  let direction = layout?.["rankDir"] ?? graphLayout.rankDir;

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

  if (isFrozen) return <FrozenLayout />;

  return (
    <WithLowerChild>
      <TabOptionsGrid>
        <OptionWithLabel label={t`Layout`}>
          <CustomSelect
            niceName={layoutNiceName}
            options={layouts}
            value={layoutName}
            onValueChange={(name) => {
              setMetaImmer((draft) => {
                if (!draft.layout) draft.layout = {};
                // This any is because typing the layout object is too restrictive
                (draft.layout as any).name = name;
                delete draft.nodePositions;
              }, "EditLayoutTab/layout");
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
                setMetaImmer((draft) => {
                  if (!draft.layout) draft.layout = {};
                  // This any is because typing the layout object is too restrictive
                  (draft.layout as any).rankDir = direction;
                  delete draft.nodePositions;
                }, "EditLayoutTab/direction");
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
          "cose",
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
                  setMetaImmer((draft) => {
                    if (!draft.layout) draft.layout = {};
                    // This any is because typing the layout object is too restrictive

                    (draft.layout as any).spacingFactor = parseFloat(
                      e.target.value
                    );
                  }, "EditLayoutTab/spacing-number");
                }}
              />
              <Range
                defaultValue={[defaultLayout.spacingFactor as number]}
                min={0.25}
                max={2}
                step={0.01}
                value={[spacingFactor || 0]}
                onValueChange={([value]) => {
                  setMetaImmer((draft) => {
                    if (!draft.layout) draft.layout = {};
                    // This any is because typing the layout object is too restrictive
                    (draft.layout as any).spacingFactor = value;
                  }, "EditLayoutTab/spacing");
                }}
              />
            </div>
          </OptionWithLabel>
        )}
      </TabOptionsGrid>
      {!isValidSponsor && (
        <LargeLink href="/pricing">
          <Trans>Get More Layouts</Trans>
        </LargeLink>
      )}
    </WithLowerChild>
  );
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
