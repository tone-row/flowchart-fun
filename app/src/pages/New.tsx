import { t, Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Session } from "@supabase/gotrue-js";
import { format } from "date-fns";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import {
  ChatTeardropText,
  Check,
  CircleNotch,
  Clock,
  Pencil,
  TreeStructure,
} from "phosphor-react";
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
import { PageTitle } from "../ui/Typography";

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

  const [name, setName] = useState<string>(getDefaultNewTitle());
  const [type, setType] = useState<"regular" | "local">(
    validCustomer ? "regular" : "local"
  );
  const [start, setStart] = useState<"blank" | "prompt">("blank");

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
    <div className="h-full pt-16">
      <form
        className="grid gap-7 px-4 w-full max-w-[580px] mx-auto"
        onSubmit={(e) => {
          e.preventDefault();
          if (customerIsLoading || !checkedSession) return;

          const formData = new FormData(e.currentTarget);
          const type = formData.get("type") as "regular" | "local";

          if (!name || !type) return;

          switch (type) {
            case "regular": {
              if (!userId) return;

              const chart = templateText ?? defaultDoc;

              // If the user is starting with a prompt, we need to get the results
              if (start === "prompt") {
                const formData = new FormData(e.currentTarget);
                const prompt = formData.get("prompt") as string;
                const method = formData.get("method") as "instruct" | "extract";
                if (!prompt || !method) return;

                mutate({
                  name,
                  user_id: userId,
                  chart,
                  prompt,
                  method,
                  fromPrompt: true,
                });
              } else {
                mutate({
                  name,
                  user_id: userId,
                  chart,
                });
              }

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
        <PageTitle className="mb-4 text-center">
          <Trans>Create a New Flowchart</Trans>
        </PageTitle>
        <div className="grid gap-2 w-full">
          <SmallLabel>
            <Trans>Name</Trans>
          </SmallLabel>
          <AutoFocusInput
            type="text"
            name="name"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl mb-2 border-b-2 border-neutral-300 p-1 rounded-tr rounded-tl dark:border-neutral-700 dark:bg-[var(--color-background)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-400 placeholder-neutral-400 dark:placeholder-neutral-400 focus:placeholder-neutral-200 dark:focus:placeholder-neutral-700 rounded-none focus:bg-neutral-50 dark:focus:bg-neutral-800"
            placeholder="Untitled"
          />
          <NameLabel name={safeName} hide={!showWarning} />
        </div>
        <div className="grid gap-2 w-full">
          <SmallLabel>
            <Trans>Type</Trans>
          </SmallLabel>
          <RadioGroup.Root
            value={type}
            name="type"
            onValueChange={(value) => {
              setType(value as "regular" | "local");
              if (value === "local") setStart("blank");
            }}
            asChild
          >
            <div className="grid gap-4 sm:grid-cols-2 focus-within:ring-4 ring-neutral-200 dark:ring-neutral-800 rounded">
              <TypeToggle
                value="regular"
                title={t`Standard`}
                description={
                  <>
                    <span className="text-sm flex items-start justify-center">
                      <Check
                        size={16}
                        weight="bold"
                        className="mr-1 mt-[2px] text-green-900 opacity-50 dark:text-green-100"
                      />
                      <Trans>Stored in the cloud</Trans>
                    </span>
                    <span className="text-sm flex items-start justify-center">
                      <Check
                        size={16}
                        weight="bold"
                        className="mr-1 mt-[2px] text-green-900 opacity-50 dark:text-green-100"
                      />
                      <Trans>Accessible from any device</Trans>
                    </span>
                  </>
                }
                icon={<TreeStructure size={64} weight="thin" />}
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
        <div className="grid gap-2 w-full">
          <SmallLabel>
            <Trans>Start</Trans>
          </SmallLabel>
          <RadioGroup.Root
            asChild
            value={start}
            onValueChange={(value) => setStart(value as "blank" | "prompt")}
            name="start"
          >
            <div className="flex justify-start gap-3 justify-self-start focus-within:ring-4 ring-neutral-200 dark:ring-neutral-800 rounded">
              <SmallTypeToggle
                title={t`Blank`}
                value="blank"
                icon={<Pencil size={24} weight="thin" />}
              />
              <SmallTypeToggle
                title={t`Prompt`}
                value="prompt"
                icon={<ChatTeardropText size={24} weight="thin" />}
                disabled={type !== "regular"}
              />
            </div>
          </RadioGroup.Root>
          {start === "prompt" && <PromptSubmenu />}
        </div>
        {tryingToCreateRegular && (
          <div className="justify-items-center grid">
            <Warning>
              <Trans>You must log in to create a standard flowchart.</Trans>{" "}
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
          className="justify-self-center bg-neutral-200 rounded-lg text-xl font-bold px-16 py-4 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-200 dark:disabled:hover:bg-neutral-800 mt-4 mb-8"
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
      <button className="bg-neutral-100 border-neutral-100 p-2 py-4 sm:p-3 sm:py-6 rounded grid justify-items-center content-center gap-2 dark:bg-neutral-800 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-700 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-700 dark:data-[state=checked]:border-neutral-400 dark:hover:border-neutral-400">
        <span className="text-2xl mb-3">{title}</span>
        {icon}
        <div className="mt-5 text-center grid gap-1 justify-items-center pb-3">
          {description}
        </div>
      </button>
    </RadioGroup.Item>
  );
}

function SmallTypeToggle({
  title,
  icon,
  ...rest
}: {
  title: string;
  icon: ReactNode;
} & Parameters<typeof RadioGroup.Item>[0]) {
  return (
    <RadioGroup.Item {...rest} asChild>
      <button className="bg-neutral-100 border-neutral-100 px-6 pl-5 py-3 rounded dark:bg-neutral-800 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-700 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-700 dark:data-[state=checked]:border-neutral-400 dark:hover:border-neutral-400 flex gap-3 items-center disabled:opacity-50 disabled:cursor-not-allowed">
        {icon}
        <span className="text-xl">{title}</span>
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

function getDefaultNewTitle() {
  return format(new Date(), "yyyy-MM-dd_HH-mm");
}

function SmallLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`text-neutral-500 text-sm ${className}`}>{children}</span>
  );
}

const placeholders: Record<"instruct" | "extract", string> = {
  instruct: `The stages of the water cycle.`,
  extract: `Water evaporates from the Earth's surface, rises into the atmosphere and falls back down as precipitation. This water then runs off into rivers, lakes and oceans, where it again evaporates and is recycled back into the atmosphere.`,
};

function PromptSubmenu() {
  const [method, setMethod] = useState<"instruct" | "extract">("instruct");
  return (
    <>
      <SmallLabel className="mt-3">
        <Trans>Method</Trans>
      </SmallLabel>
      <RadioGroup.Root
        value={method}
        name="method"
        onValueChange={(value) => setMethod(value as "instruct" | "extract")}
      >
        <div className="flex justify-start gap-3 justify-self-start focus-within:ring-4 ring-neutral-200 dark:ring-neutral-800 rounded">
          <PromptSubmenuRadioItem
            value="instruct"
            title={t`Instruct`}
            description={t`Describe the flowchart you wish to create`}
          />
          <PromptSubmenuRadioItem
            value="extract"
            title={t`Extract`}
            description={t`Paste the information you wish to convert to a flowchart`}
          />
        </div>
      </RadioGroup.Root>
      <Textarea
        className="resize-none mt-2"
        rows={6}
        name="prompt"
        placeholder={placeholders[method]}
      />
    </>
  );
}

function PromptSubmenuRadioItem({
  title,
  description,
  ...rest
}: {
  title: string;
  description: ReactNode;
} & Parameters<typeof RadioGroup.Item>[0]) {
  return (
    <RadioGroup.Item {...rest} asChild>
      <button
        data-testid={rest.value}
        className="bg-neutral-100 border-neutral-100 p-4 rounded grid justify-start text-left gap-1 dark:bg-neutral-800 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-700 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-700 dark:data-[state=checked]:border-neutral-400 dark:hover:border-neutral-400 max-w-[300px]"
      >
        <span className="font-bold text-neutral-700 dark:text-neutral-100 mb-1">
          {title}
        </span>
        <div className="text-sm text-neutral-500 dark:text-neutral-300">
          {description}
        </div>
      </button>
    </RadioGroup.Item>
  );
}

function Textarea({
  className = "",
  ...rest
}: React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & { className?: string }) {
  return (
    <textarea
      data-testid="prompt-entry-textarea"
      className={`bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 rounded p-2 text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-400 ${className}`}
      {...rest}
    />
  );
}
