import { t, Trans } from "@lingui/macro";
import throttle from "lodash.throttle";

import { getDoc, setDocImmer } from "../../lib/docHelpers";
import { themes } from "../../lib/graphOptions";
import {
  useBackgroundColor,
  useCurrentTheme,
  useThemeKey,
} from "../../lib/graphThemes";
import { useIsValidSponsor } from "../../lib/hooks";
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
  const theme = useCurrentTheme(themeKey);
  const meta = getDoc().meta;
  const bg = useBackgroundColor(theme);
  return (
    <WithLowerChild>
      <TabOptionsGrid>
        <OptionWithLabel label={t`Theme`}>
          <CustomSelect
            niceName={themeNiceName}
            options={themes}
            value={themeKey}
            onValueChange={(themeKey) => {
              setDocImmer((draft) => {
                draft.meta.theme = themeKey;
              }, "EditStyleTab/theme");
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
              value={bg}
              onChange={(e) => {
                throttleBGUpdate(e.target.value);
              }}
            />
            {meta.background && (
              <Button
                onClick={() => {
                  setDocImmer((draft) => {
                    delete draft.meta?.background;
                  }, "EditStyleTab/remove-bg");
                  // find an input[type=color] and set it to the background color
                  const colorInput = document.querySelector(
                    "input[type=color]"
                  ) as HTMLInputElement;
                  if (colorInput) {
                    colorInput.value = theme?.bg ?? "#ffffff";
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
        <LargeLink href="/pricing">
          <Trans>Get More Themes</Trans>
        </LargeLink>
      )}
    </WithLowerChild>
  );
}

const throttleBGUpdate = throttle(
  (bg: string) => {
    setDocImmer((draft) => {
      draft.meta.background = bg;
    }, "EditStyleTab/bg");
  },
  75,
  {
    trailing: true,
  }
);
