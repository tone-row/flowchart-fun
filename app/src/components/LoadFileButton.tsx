import { FileArrowUp } from "phosphor-react";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { Trans, t } from "@lingui/macro";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Content, Overlay } from "../ui/Dialog";
import { Button2 } from "../ui/Shared";
import { useIsProUser } from "../lib/hooks";
import { showPaywall } from "../lib/usePaywallModalStore";
import { getExpirationDate } from "../lib/getExpirationDate";
import { docToString } from "../lib/useDoc";

export function LoadFileButton() {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState("");
  const [chart, setChart] = useState<null | Awaited<
    ReturnType<typeof prepareChart>
  >>(null);
  const isProUser = useIsProUser();

  return (
    <>
      <input
        type="file"
        accept=".txt"
        data-testid="load-file-input"
        className="sr-only"
        onChange={(event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (event) => {
            const result = event.target?.result as string;
            try {
              prepareChart({
                doc: result,
                set: false,
                details: {
                  id: "",
                  title: "",
                  isHosted: false,
                },
              })
                .then((chart) => {
                  console.log({ chart });
                  if (chart) {
                    // build a chart with a normal expiry date
                    const { text, details, ...rest } = chart;
                    const meta = { ...rest.meta, expires: getExpirationDate() };
                    const doc = docToString({ text, meta, details });
                    setChart(chart);
                    setDoc(doc);
                    setOpen(true);
                  } else {
                    setOpen(false);
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            } catch (error) {
              console.error(error);
            }
          };
          reader.readAsText(file);
        }}
      />
      <EditorActionTextButton
        icon={FileArrowUp}
        data-testid="load-file-button"
        onClick={() => {
          if (!isProUser) {
            showPaywall({
              title: t`Load Files`,
              content: t`Experience the efficiency and security of loading local files directly into your flowchart, perfect for managing work-related documents offline. Unlock this exclusive Pro feature and more with Flowchart Fun Pro, available for only $3/month or $30/year.`,
              movieUrl:
                "https://res.cloudinary.com/tone-row/video/upload/v1697510980/b6u3smok1vc2jqb56tb1.mp4",
              toPricingCode: "Local Files",
            });
            return;
          }

          const input = document.querySelector(
            'input[data-testid="load-file-input"]'
          ) as HTMLInputElement;
          if (input) {
            input.click();
          }
        }}
      >
        <Trans>Load File</Trans>
      </EditorActionTextButton>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Overlay />
        <Content>
          <Dialog.Description asChild>
            <div className="grid gap-2" data-testid="load-file-modal">
              <h2 className="text-lg text-wrap-balance leading-[1.3] font-bold">
                <Trans>Load Chart</Trans>
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-normal mb-2 text-wrap-balance">
                Do you want to replace your sandbox with this chart?
              </p>
              <div className="w-full h-32 overflow-hidden whitespace-pre-wrap break-words bg-neutral-200 dark:bg-neutral-800 rounded-md p-2 font-mono leading-normal text-[12px] relative import-file-textarea select-none">
                {chart?.text}
              </div>
              <Button2
                color="blue"
                leftIcon={<FileArrowUp className="w-5 h-5" />}
                data-testid="load-file-confirm"
                onClick={() => {
                  // navigate to the sandbox
                  if (!chart) return;
                  // close the dialog
                  setOpen(false);
                  // load the chart
                  prepareChart({
                    doc,
                    set: true,
                    details: chart.details,
                  });
                }}
              >
                Load
              </Button2>
            </div>
          </Dialog.Description>
          <Dialog.Close />
        </Content>
      </Dialog.Root>
    </>
  );
}
