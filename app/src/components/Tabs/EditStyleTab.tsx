import produce from "immer";

import { useThemeKey, useThemeObject } from "../../lib/getTheme";
import { themes } from "../../lib/graphOptions";
import { useDoc } from "../../lib/prepareChart";
import { CustomSelect, OptionWithLabel, TabOptionsGrid } from "./shared";

export function EditStyleTab() {
  const themeKey = useThemeKey();
  console.log("themeKey", themeKey);
  const themeNiceName =
    themes.find((t) => t.value === themeKey)?.label() ?? "Unknown";
  const themeObject = useThemeObject();
  const meta = useDoc((s) => s.meta);
  const background = useDoc(
    (s) => s.meta?.background ?? themeObject.bg
  ) as string;
  return (
    <TabOptionsGrid>
      <OptionWithLabel label="Theme">
        <CustomSelect
          niceName={themeNiceName}
          options={themes}
          value={themeKey}
          onValueChange={(themeKey) => {
            useDoc.setState((s) => {
              return produce(s, (draft) => {
                draft.meta.theme = themeKey;
              });
            });
          }}
        />
      </OptionWithLabel>
      <OptionWithLabel label="Background">
        <input
          type="color"
          value={background}
          onChange={(e) => {
            useDoc.setState((s) => {
              return produce(s, (draft) => {
                draft.meta.background = e.target.value;
              });
            });
          }}
        />
        {meta.background && (
          <button
            onClick={() => {
              useDoc.setState((s) => {
                return produce(s, (draft) => {
                  delete draft.meta?.background;
                });
              });
            }}
          >
            Remove
          </button>
        )}
      </OptionWithLabel>
    </TabOptionsGrid>
  );
}
