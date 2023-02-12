import { t, Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Session } from "@supabase/gotrue-js";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { Check, CircleNotch, Clock, Globe } from "phosphor-react";
import {
  memo,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation } from "react-query";
import { Link, useHistory, useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { Warning } from "../components/Warning";
import { getDefaultChart } from "../lib/getDefaultChart";
import { slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidCustomer } from "../lib/hooks";
import { makeChart, queryClient } from "../lib/queries";

export default function M() {
  const { customerIsLoading, session, checkedSession } = useContext(AppContext);
  const validCustomer = useIsValidCustomer();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  const templateText = decompress(graphText);

  // If there is template text, create a temporary chart with it
  useEffect(() => {
    if (templateText) {
      let i = 1;
      while (localStorage.getItem(titleToLocalStorageKey(`temp-${i}`))) {
        i++;
      }
      const title = `temp-${i}`;
      localStorage.setItem(titleToLocalStorageKey(title), templateText);
      window.location.replace(`/${title}`);
    }
  }, [templateText]);

  if (customerIsLoading || !checkedSession) {
    return <Loading />;
  }

  return (
    <New
      customerIsLoading={customerIsLoading}
      session={session}
      checkedSession={checkedSession}
      validCustomer={validCustomer}
      templateText={templateText}
    />
  );
}

const New = memo(function New({
  customerIsLoading,
  session,
  checkedSession,
  validCustomer,
  templateText,
}: {
  customerIsLoading: boolean;
  session: Session | null;
  checkedSession: boolean;
  validCustomer: boolean;
  templateText: string | null;
}) {
  const defaultDoc = getDefaultChart();
  const { replace } = useHistory();

  const userId = session?.user?.id;

  const [name, setName] = useState<string>("");
  const [type, setType] = useState<"regular" | "local">(
    validCustomer ? "regular" : "local"
  );

  // Boilerplate to create a new chart
  const { mutate, isLoading } = useMutation("makeChart", makeChart, {
    retry: false,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      replace(`/u/${response.data[0].id}`);
    },
  });

  const isTemporaryType = type === "local";
  const safeName = slugify(name.trim());
  const showWarning = isTemporaryType && safeName !== name;

  const tryingToCreateRegular = type === "regular" && !validCustomer;
  const alreadyUsedName =
    type === "local" &&
    !!safeName &&
    !!window.localStorage.getItem(titleToLocalStorageKey(safeName));
  const createDisabled = !name || tryingToCreateRegular || alreadyUsedName;

  return (
    <div className="h-full grid content-start pt-16 justify-center">
      <form
        className="grid gap-7 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (customerIsLoading || !checkedSession) return;

          const formData = new FormData(e.currentTarget);
          const type = formData.get("type") as "regular" | "local";

          if (!name || !type) return;

          switch (type) {
            case "regular": {
              if (!userId) return;
              mutate({
                name,
                user_id: userId,
                chart: templateText ?? defaultDoc,
              });
              break;
            }
            case "local": {
              const newKey = titleToLocalStorageKey(safeName);
              window.localStorage.setItem(newKey, templateText ?? defaultDoc);
              replace(`/${safeName}`);
              break;
            }
          }
        }}
      >
        <h3 className="text-3xl font-bold mb-4 flex items-center justify-center">
          <Trans>Create a New Flowchart</Trans>
        </h3>
        <div className="grid gap-2 w-full">
          <span className="text-neutral-500 text-sm">
            <Trans>Name</Trans>
          </span>
          <AutoFocusInput
            type="text"
            name="name"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl mb-3 border-b-2 border-neutral-300 pb-1 dark:border-neutral-700 dark:bg-[var(--color-background)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-400 placeholder-neutral-400 dark:placeholder-neutral-400 focus:placeholder-neutral-200 dark:focus:placeholder-neutral-700"
            placeholder="Untitled"
          />
          <NameLabel name={safeName} hide={!showWarning} />
        </div>
        <div className="grid gap-2 w-full">
          <span className="text-neutral-500 text-sm">
            <Trans>Type</Trans>
          </span>
          <RadioGroup.Root
            value={type}
            name="type"
            onValueChange={(value) => setType(value as "regular" | "local")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TypeToggle
                value="regular"
                title={t`Normal`}
                description={
                  <>
                    <span className="text-sm flex items-center justify-center">
                      <Check size={16} weight="thin" className="mr-1" />
                      <Trans>Stored in the cloud</Trans>
                    </span>
                    <span className="text-sm flex items-center justify-center">
                      <Check size={16} weight="thin" className="mr-1" />
                      <Trans>Accessible from any device</Trans>
                    </span>
                  </>
                }
                icon={<Globe size={64} weight="thin" />}
              />
              <TypeToggle
                value="local"
                title={t`Temporary`}
                description={
                  <>
                    <span className="text-sm flex items-center">
                      <Trans>Stored on this computer</Trans>
                    </span>
                    <span className="text-sm flex items-center">
                      <Trans>Deleted when browser data is cleared</Trans>
                    </span>
                  </>
                }
                icon={<Clock size={64} weight="thin" />}
              />
            </div>
          </RadioGroup.Root>
        </div>
        {tryingToCreateRegular && (
          <div className="justify-items-center grid">
            <Warning>
              <Trans>You must log in to create a normal flowchart.</Trans>{" "}
              <Link className="underline" to="/l">
                <Trans>Log In</Trans>
              </Link>
            </Warning>
          </div>
        )}
        {alreadyUsedName && (
          <div className="justify-items-center grid">
            <Warning>
              <Trans>You already have a flowchart with this name.</Trans>
            </Warning>
          </div>
        )}
        <button
          type="submit"
          className="justify-self-center bg-neutral-200 rounded-lg text-xl font-bold px-16 py-4 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 mt-8"
          disabled={createDisabled}
        >
          {isLoading ? (
            <CircleNotch size={24} className="animate-spin" />
          ) : (
            <Trans>Create</Trans>
          )}
        </button>
      </form>
    </div>
  );
});

function TypeToggle({
  title,
  description,
  icon,
  ...rest
}: {
  title: string;
  description: ReactNode;
  icon: ReactNode;
} & Parameters<typeof RadioGroup.Item>[0]) {
  return (
    <RadioGroup.Item {...rest} asChild>
      <button className="bg-neutral-100 border-neutral-100 p-3 py-6 rounded grid justify-items-center content-center gap-2 dark:bg-neutral-800 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-700 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-700 dark:data-[state=checked]:border-neutral-400 dark:hover:border-neutral-400 max-w-[300px]">
        <span className="text-2xl mb-3">{title}</span>
        {icon}
        <div className="mt-5 text-center grid gap-1 justify-items-center pb-3">
          {description}
        </div>
      </button>
    </RadioGroup.Item>
  );
}

/**
 * A *note* label that tells the user what they're chart will be named
 */
function NameLabel({ name, hide }: { name: string; hide?: boolean }) {
  if (hide)
    return (
      <span className="text-neutral-400 font-bold italic text-xs mt-[-6px]">
        &nbsp;
      </span>
    );
  return (
    <div className="text-neutral-400 text-xs flex items-center justify-start mt-[-6px]">
      <span className="font-bold italic">{name}</span>
    </div>
  );
}

/**
 * A component that autofocuses it's first input on mount
 */
function AutoFocusInput(
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);
  return <input ref={ref} {...props} />;
}
