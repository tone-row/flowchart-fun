import * as Dialog from "@radix-ui/react-dialog";
import { Close, Content, Overlay } from "../ui/Dialog";
import { Trans } from "@lingui/macro";
import { Button2 } from "../ui/Shared";
import { getTemporaryCharts } from "../lib/getTemporaryCharts";
import { ReactNode, useState } from "react";
import * as Progress from "@radix-ui/react-progress";
import { makeChart } from "../lib/queries";
import { titleToLocalStorageKey } from "../lib/helpers";
import { useSession } from "./AppContext";
import { getDefaultChart } from "../lib/getDefaultChart";

/**
 * A modal to handle migrating temporary flowcharts into hosted ones
 */
export function MigrateTempFlowchartsModal({
  children,
}: {
  children: ReactNode;
}) {
  const [numCharts] = useState(() => getTemporaryCharts().length);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrated, setMigrated] = useState(0);
  const userId = useSession()?.user.id;
  if (!userId) return null;
  return (
    <Dialog.Root open={isMigrating ? true : undefined}>
      <Dialog.Trigger>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content maxWidthClass="w-full max-w-md p-6">
          <Dialog.Title className="text-xl mb-2 mt-3 font-bold text-center">
            <Trans>Migrate Flowcharts</Trans>
          </Dialog.Title>
          <Trans>
            <p className="leading-6 text-neutral-600">
              Click the button below to migrate all of your temporary flowcharts
              into hosted ones.
            </p>
            <p className="leading-6 text-neutral-600">
              Do not close this window. The page will refresh when the migration
              is complete.
            </p>
          </Trans>
          <Button2
            color="blue"
            className="mt-4"
            isLoading={isMigrating}
            onClick={() => {
              setIsMigrating(true);
              migrateTemporaryFlowcharts(setMigrated, userId);
            }}
          >
            Start Migration
          </Button2>
          <p className="mt-4 text-center font-mono text-neutral-600 text-xs">
            Migrated {migrated} of {numCharts} flowcharts
          </p>
          <Progress.Root
            className="relative overflow-hidden rounded-full w-full h-2 bg-neutral-300 dark:bg-neutral-700"
            style={{
              // Fix overflow clipping in Safari
              // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
              transform: "translateZ(0)",
            }}
          >
            <Progress.Indicator
              className="w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)] bg-blue-500 dark:bg-neutral-400 animate-pulse"
              style={{
                transform: `translateX(-${
                  100 - (migrated / numCharts) * 100
                }%)`,
              }}
            />
          </Progress.Root>
          {isMigrating ? null : <Close />}
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

async function migrateTemporaryFlowcharts(
  setMigrated: (n: number) => void,
  userId: string
) {
  const temporaryCharts = getTemporaryCharts();

  let i = 0;
  for (const key of temporaryCharts) {
    const name = key ? key : "flowchart.fun";
    const localStorageKey = titleToLocalStorageKey(key);
    const chart = localStorage.getItem(localStorageKey);

    if (chart) {
      const response = await makeChart({
        name,
        chart,
        user_id: userId,
      });

      if (!response || response.error) {
        // don't delete the temporary chart
        continue;
      }

      // delete the temporary chart, unless it's the default one, in which case, reset it
      if (key) {
        localStorage.removeItem(localStorageKey);
      } else {
        localStorage.setItem(localStorageKey, getDefaultChart());
      }
    }

    setMigrated(++i);
  }

  // refresh the page
  window.location.reload();
}
