import { t, Trans } from "@lingui/macro";
import produce from "immer";
import throttle from "lodash.throttle";

import { useThemeKey } from "../../lib/getTheme";
import { themes } from "../../lib/graphOptions";
import { useThemeStore } from "../../lib/graphThemes";
import { useIsValidSponsor } from "../../lib/hooks";
import { useDoc } from "../../lib/prepareChart";
import { Button } from "../Shared";
import {
  CustomSelect,
  LargeLink,
  OptionWithLabel,
  TabOptionsGrid,
  WithLowerChild,
} from "./shared";

export function EditStyleTab() {
  const isValidSponsor = useIsValidSponsor();
  const themeKey = useThemeKey();
  const themeNiceName =
    themes.find((t) => t.value === themeKey)?.label() ?? "???";
  const theme = useThemeStore();
  const meta = useDoc((s) => s.meta);
  const background = useDoc((s) => s.meta?.background ?? theme.bg) as string;
  return (
    <WithLowerChild>
      <TabOptionsGrid>
        <OptionWithLabel label={t`Theme`}>
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
        <OptionWithLabel label={t`Background`}>
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              justifyContent: "start",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              type="color"
              defaultValue={background}
              onChange={(e) => {
                throttleBGUpdate(e.target.value);
              }}
            />
            {meta.background && (
              <Button
                onClick={() => {
                  useDoc.setState((s) => {
                    return produce(s, (draft) => {
                      delete draft.meta?.background;
                    });
                  });
                  // find an input[type=color] and set it to the background color
                  const colorInput = document.querySelector(
                    "input[type=color]"
                  ) as HTMLInputElement;
                  if (colorInput) {
                    colorInput.value = theme.bg;
                  }
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </OptionWithLabel>
      </TabOptionsGrid>
      {!isValidSponsor && (
        <LargeLink href="/sponsor">
          <Trans>Get More Themes</Trans>
        </LargeLink>
      )}
    </WithLowerChild>
  );
}

const throttleBGUpdate = throttle(
  (bg: string) => {
    useDoc.setState((s) => {
      return produce(s, (draft) => {
        draft.meta.background = bg;
      });
    });
  },
  75,
  {
    trailing: true,
  }
);
