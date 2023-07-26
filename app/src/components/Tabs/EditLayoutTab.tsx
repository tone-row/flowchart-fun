import { t, Trans } from "@lingui/macro";
import produce from "immer";
import { Palette } from "phosphor-react";
import { FaRegSnowflake } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { GraphOptionsObject } from "../../lib/constants";
import { defaultLayout, getLayout } from "../../lib/getLayout";
import { directions, layouts } from "../../lib/graphOptions";
import { hasOwnProperty } from "../../lib/helpers";
import { useIsProUser } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { unfreezeDoc, useIsFrozen } from "../../lib/useIsFrozen";
import { BasicSelect } from "../../ui/Select";
import { Button2 } from "../../ui/Shared";
import styles from "./EditLayoutTab.module.css";
import {
  OptionWithLabel,
  Range,
  TabOptionsGrid,
  WithLowerChild,
} from "./shared";

export function EditLayoutTab() {
  const isProUser = useIsProUser();
  const doc = useDoc();
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

  let spacingFactor = defaultLayout.spacingFactor;
  if (
    typeof layout === "object" &&
    layout &&
    hasOwnProperty(layout, "spacingFactor") &&
    typeof layout.spacingFactor === "number"
  ) {
    spacingFactor = layout.spacingFactor;
  }

  const navigate = useNavigate();

  if (isFrozen) return <FrozenLayout />;

  return (
    <WithLowerChild>
      <TabOptionsGrid>
        <OptionWithLabel label={t`Layout`}>
          <BasicSelect
            value={layoutName}
            onValueChange={(name) => {
              useDoc.setState(
                (state) => {
                  return produce(state, (draft) => {
                    if (!draft.meta.layout) draft.meta.layout = {};
                    // This any is because typing the layout object is too restrictive
                    (draft.meta.layout as any).name = name;
                    delete draft.meta.nodePositions;
                  });
                },
                false,
                "EditLayoutTab/layout"
              );
            }}
            options={layouts
              .filter((l) => l?.sponsorOnly === undefined || isProUser)
              .map((l) => ({
                value: l.value,
                label: l.label(),
              }))}
          />
        </OptionWithLabel>
        {["dagre"].includes(layoutName) && (
          <OptionWithLabel label={t`Direction`}>
            <BasicSelect
              options={directions.map((d) => ({
                value: d.value,
                label: d.label(),
              }))}
              value={direction}
              onValueChange={(direction) => {
                useDoc.setState(
                  (state) => {
                    return produce(state, (draft) => {
                      if (!draft.meta.layout) draft.meta.layout = {};
                      // This any is because typing the layout object is too restrictive
                      (draft.meta.layout as any).rankDir = direction;
                      delete draft.meta.nodePositions;
                    });
                  },
                  false,
                  "EditLayoutTab/direction"
                );
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
                className="text-xs w-16 mr-2 pl-3 dark:bg-[var(--color-background)] dark:text-white"
                onChange={(e) => {
                  useDoc.setState(
                    (state) => {
                      return produce(state, (draft) => {
                        if (!draft.meta.layout) draft.meta.layout = {};
                        // This any is because typing the layout object is too restrictive

                        (draft.meta.layout as any).spacingFactor = parseFloat(
                          e.target.value
                        );
                      });
                    },
                    false,
                    "EditLayoutTab/spacing-number"
                  );
                }}
              />
              <Range
                defaultValue={[defaultLayout.spacingFactor as number]}
                min={0.25}
                max={2}
                step={0.01}
                value={[spacingFactor || 0]}
                onValueChange={([value]) => {
                  useDoc.setState(
                    (state) => {
                      return produce(state, (draft) => {
                        if (!draft.meta.layout) draft.meta.layout = {};
                        // This any is because typing the layout object is too restrictive
                        (draft.meta.layout as any).spacingFactor = value;
                      });
                    },
                    false,
                    "EditLayoutTab/spacing"
                  );
                }}
              />
            </div>
          </OptionWithLabel>
        )}
      </TabOptionsGrid>
      {!isProUser && (
        <Button2
          color="blue"
          size="md"
          rightIcon={<Palette size={20} />}
          className="ml-5 mr-1"
          onClick={() => navigate("/pricing")}
        >
          <Trans>Get More Layouts</Trans>
        </Button2>
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
