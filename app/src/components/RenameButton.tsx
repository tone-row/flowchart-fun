import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { ChangeEvent, memo, ReactNode, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import { isError, slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidSponsor } from "../lib/hooks";
import { makeChart, renameChart } from "../lib/queries";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { Close, Content, Overlay } from "../ui/Dialog";
import { Button2, Input, Notice, Section } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";
import { useSession } from "./AppContext";

export const RenameButton = memo(function RenameButton({
  children,
}: {
  children: ReactNode;
}) {
  const fullText = useDoc(docToString);
  const isValidSponsor = useIsValidSponsor();
  const session = useSession();
  const initialName = useDocDetails("title", "flowchart.fun");
  const isHosted = useDocDetails("isHosted");
  const id = useDocDetails("id");
  const navigate = useNavigate();
  const isOpen = useRenameDialogStore((store) => store.isOpen);
  const convertToHosted = useRenameDialogStore(
    (store) => store.convertToHosted
  );
  const [curName, setName] = useState(initialName);

  const inputRef = useRef<null | HTMLInputElement>(null);
  const rename = useMutation(
    "updateChartName",
    async (newName: string) => {
      if (isHosted && id && typeof id === "number") {
        await renameChart(id, newName);
      } else if (convertToHosted) {
        if (session?.user?.id) {
          const response = await makeChart({
            name: newName,
            user_id: session?.user?.id,
            chart: fullText,
          });
          if (!response) throw new Error("Could not create hosted chart");
          const charts = response.data;
          if (!charts) throw new Error("Could not create hosted chart");
          const chart = charts[0];
          if (!chart) throw new Error("Could not create hosted chart");
          navigate(`/u/${chart.id}`);
        }
      } else {
        const oldKey = titleToLocalStorageKey(slugify(initialName));
        const newSlug = slugify(newName);
        const newKey = titleToLocalStorageKey(newSlug);
        if (window.localStorage.getItem(newKey) !== null)
          throw new Error("Chart already exists");
        window.localStorage.setItem(newKey, fullText);
        navigate(`/${newSlug}`);
        window.localStorage.removeItem(oldKey);
      }
    },
    {
      onSuccess: () => {
        useRenameDialogStore.setState({ isOpen: false });
      },
    }
  );

  let isValid = false;
  const lengthMoreThanTwo = curName.length > 2;
  if (convertToHosted) {
    isValid = !!curName;
  } else {
    isValid =
      window.localStorage.getItem(titleToLocalStorageKey(curName)) === null &&
      lengthMoreThanTwo &&
      curName !== initialName;
  }

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(open) => {
          useRenameDialogStore.setState({ isOpen: open });
        }}
        modal
      >
        <Dialog.Trigger asChild>
          <button
            data-rename-button
            onClick={() => useRenameDialogStore.setState({ isOpen: true })}
            aria-label={t`Rename`}
          >
            {children}
          </button>
        </Dialog.Trigger>
        <Overlay />
        <Content>
          <Close />
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const name = formData.get("name") as string;
              if (!name) return;
              rename.mutate(name);
            }}
          >
            <Section>
              <SectionTitle className="mb-[-8px]">
                <Trans>Rename</Trans>
              </SectionTitle>
              {isValidSponsor && !isHosted ? (
                <label className="flex gap-2 item-center mt-2">
                  <span className="text-xs opacity-80">
                    <Trans>Convert to hosted chart?</Trans>
                  </span>
                  <input
                    type="checkbox"
                    checked={convertToHosted}
                    onChange={(e) => {
                      useRenameDialogStore.setState({
                        convertToHosted: e.target.checked,
                      });
                    }}
                  />
                </label>
              ) : null}
              <Input
                // value={newName}
                required
                pattern=".{3,}"
                defaultValue={initialName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                isLoading={rename.isLoading}
                name="name"
                ref={inputRef}
              />
              <div className="flex justify-between">
                <Button2
                  type="button"
                  onClick={() =>
                    useRenameDialogStore.setState({ isOpen: false })
                  }
                >
                  <Trans>Cancel</Trans>
                </Button2>
                <Button2 type="submit" disabled={!isValid} color="blue">
                  <Trans>Rename</Trans>
                </Button2>
              </div>
              {isError(rename.error) && <Notice>{rename.error.message}</Notice>}
            </Section>
          </form>
        </Content>
      </Dialog.Root>
    </>
  );
});
