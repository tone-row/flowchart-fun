import { decompressFromEncodedURIComponent } from "lz-string";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Content, Overlay } from "../ui/Dialog";
import { Button2 } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";
import { Trans } from "@lingui/macro";
import { Warning } from "phosphor-react";
import { useLocation } from "react-router-dom";
import { SANDBOX_STORAGE_KEY, newDelimiters } from "../lib/constants";
import { addDays } from "date-fns";
import { prepareChart } from "../lib/prepareChart/prepareChart";

/**
 * This is used on the sandbox to ask the user if they want to load the Editable link they clicked.
 *
 * It warns them that it will replace their current sandbox.
 */
export function LoadFromHashDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { hash } = useLocation();
  useEffect(() => {
    // Check if matches #load:...
    if (hash.startsWith("#load:")) {
      setIsOpen(true);
    }
  }, [hash]);
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Overlay />
        <Content>
          <div className="grid gap-4">
            <Dialog.Title>
              <SectionTitle>
                <Trans>Load from link?</Trans>
              </SectionTitle>
            </Dialog.Title>
            <Dialog.Description>
              <Warning className="mr-px inline-block -translate-y-px" />{" "}
              <Trans>This will replace your current sandbox.</Trans>
            </Dialog.Description>
            <div className="flex gap-1 items-center mt-4 justify-between">
              <Button2
                onClick={() => {
                  setIsOpen(false);
                  // wipe the hash
                  window.location.hash = "";
                }}
              >
                Cancel
              </Button2>
              <Button2
                color="inverted"
                onClick={() => {
                  const graphText = hash.slice("#load:".length);
                  const graph = decompressFromEncodedURIComponent(graphText);
                  if (!graph) return;
                  try {
                    const [text, metaStr] = graph.split(newDelimiters);
                    const meta = JSON.parse(metaStr.trim());
                    meta.expires = addDays(new Date(), 1).toISOString();
                    const final = `${text}\n=====\n${JSON.stringify(
                      meta,
                      null,
                      2
                    )}\n=====`;
                    localStorage.setItem(SANDBOX_STORAGE_KEY, final);
                    prepareChart({
                      doc: final,
                      details: {
                        id: "",
                        title: "",
                        isHosted: false,
                      },
                    });
                  } catch (error) {
                    console.error(error);
                  } finally {
                    setIsOpen(false);
                    // wipe the hash
                    window.location.hash = "";
                  }
                }}
              >
                Load
              </Button2>
            </div>
          </div>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
