import { useAutoAnimate } from "@formkit/auto-animate/react";
import { t, Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Session } from "@supabase/supabase-js";
import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import {
  ChatTeardropText,
  Check,
  Clock,
  Pencil,
  TreeStructure,
} from "phosphor-react";
import {
  forwardRef,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation } from "react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { Warning } from "../components/Warning";
import { getDefaultChart } from "../lib/getDefaultChart";
import { getFunFlowchartName } from "../lib/getFunFlowchartName";
import { slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsProUser } from "../lib/hooks";
import { makeChart, queryClient } from "../lib/queries";
import { languages } from "../locales/i18n";
import { Button2, Page } from "../ui/Shared";
import { PageTitle } from "../ui/Typography";
import { usePaywallModalStore } from "../components/PaywallModal";

export default function M() {
  const { customerIsLoading, session, checkedSession } = useContext(AppContext);
  const isProUser = useIsProUser();
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
      isProUser={isProUser}
      templateText={templateText}
    />
  );
}

const New = memo(function New({
  customerIsLoading,
  session,
  checkedSession,
  isProUser,
  templateText,
}: {
  customerIsLoading: boolean;
  session: Session | null;
  checkedSession: boolean;
  isProUser: boolean;
  templateText: string | null;
}) {
  const defaultDoc = getDefaultChart();
  const navigate = useNavigate();

  const userId = session?.user?.id;

  const language = useContext(AppContext).language;
  const [name, setName] = useState<string>(
    getFunFlowchartName(language as keyof typeof languages)
  );
  const [type, setType] = useState<"regular" | "local">(
    isProUser ? "regular" : "local"
  );
  const [start, setStart] = useState<"blank" | "prompt">("blank");

  // Boilerplate to create a new chart
  const makeChartMutation = useMutation("makeChart", makeChart, {
    retry: false,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      navigate(`/u/${response.data[0].id}`, {
        replace: true,
      });
    },
  });

  const isTemporaryType = type === "local";
  const safeName = slugify(name.trim());
  const showWarning = isTemporaryType;

  const tryingToCreatePermanent = type === "regular" && !isProUser;
  const alreadyUsedName =
    type === "local" &&
    !!safeName &&
    !!window.localStorage.getItem(titleToLocalStorageKey(safeName));
  const createDisabled = !name || tryingToCreatePermanent || alreadyUsedName;

  const [parent] = useAutoAnimate();

  return (
    <Page>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (customerIsLoading || !checkedSession) return;
          if (!isProUser) {
            usePaywallModalStore.setState({
              open: true,
              title: t`Get Unlimited Flowcharts`,
              content: t`Flowchart Fun Pro gives you unlimited flowcharts, unlimited collaborators, and unlimited storage for just $3/month or $30/year.`,
            });
            return;
          }

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

                makeChartMutation.mutate({
                  name,
                  user_id: userId,
                  chart,
                  prompt,
                  method,
                  fromPrompt: true,
                });
              } else {
                makeChartMutation.mutate({
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
              navigate(`/${safeName}`, {
                replace: true,
              });
              break;
            }
          }
        }}
      >
        <div className="grid gap-7 content-start" ref={parent}>
          <PageTitle className="mb-4 text-center">
            <Trans>Create a New Flowchart</Trans>
          </PageTitle>
          <div className="grid gap-0 w-full content-start">
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
          {alreadyUsedName && (
            <div className="justify-items-center grid">
              <Warning>
                <Trans>You already have a flowchart with this name.</Trans>
              </Warning>
            </div>
          )}
          <div className="grid gap-3 w-full">
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
                  title={t`Permanent`}
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
                  disabled={isProUser}
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
          {tryingToCreatePermanent && (
            <div className="justify-items-center grid">
              <Warning>
                <Link to="/pricing">
                  <Trans>
                    You can create unlimited permanent flowcharts with{" "}
                    <span className="underline underline-offset-2">
                      Flowchart Fun Pro
                    </span>
                    .
                  </Trans>
                </Link>
              </Warning>
            </div>
          )}
        </div>
        <div className="grid gap-7 mt-7">
          <div className="grid gap-3 w-full">
            <SmallLabel>
              <Trans>Getting Started</Trans>
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
            <PromptDescription start={start} />
            {start === "prompt" && <PromptSubmenu />}
          </div>
          <Button2
            type="submit"
            disabled={createDisabled}
            isLoading={makeChartMutation.isLoading}
            color="blue"
            size="md"
            className="mx-auto"
          >
            <Trans>Create New Flowchart</Trans>
          </Button2>
        </div>
      </form>
    </Page>
  );
});

function PromptDescription({ start }: { start: "prompt" | "blank" }) {
  switch (start) {
    case "blank":
      return (
        <span className="text-xs text-neutral-500 italic">
          <Trans>
            Begin with a simple example showing how <span>Flowchart Fun</span>{" "}
            works.
          </Trans>
        </span>
      );
    case "prompt":
      return (
        <span className="text-xs text-neutral-500 italic">
          <Trans>
            Use AI to generate a flowchart from a prompt.{" "}
            <Link
              to="/blog/post/flowchart-fun-ai-prompt-feature-demo"
              className="underline"
            >
              Learn More
            </Link>
          </Trans>
        </span>
      );
  }
}

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
      <button className="bg-neutral-100 border-neutral-100 p-2 py-4 sm:p-3 sm:py-6 rounded grid justify-items-center content-center gap-2 dark:bg-neutral-700 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-600 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-800 dark:data-[state=checked]:border-neutral-500 dark:hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50">
        <span className="text-2xl mb-3">{title}</span>
        {icon}
        <div className="mt-5 text-center grid gap-2 justify-items-center pb-3">
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
      <button className="bg-neutral-100 border-neutral-100 px-6 pl-5 py-3 rounded dark:bg-neutral-700 data-[state=checked]:bg-neutral-200 dark:data-[state=checked]:bg-neutral-600 data-[state=checked]:border-neutral-400 border-solid border border-b-2 transition duration-200 ease-in-out outline-none focus:shadow-none focus:outline-none hover:border-neutral-200 dark:border-neutral-800 dark:data-[state=checked]:border-neutral-500 dark:hover:border-neutral-400 flex gap-3 items-center disabled:opacity-50 disabled:cursor-not-allowed">
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
  if (hide) return null;
  return (
    <div className="text-neutral-400 text-xs flex items-center justify-start">
      <span className="font-bold italic">/{name}</span>
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

const promptExamples = {
  instruct: [
    () =>
      t`Market understanding and competitive landscape maintenance for SaaS product development`,
    () =>
      t`Process for corporate social responsibility initiatives development and implementation across company operations`,
    () =>
      t`Supply chain analysis and optimization: cost reduction, efficiency improvement, and stakeholder collaboration`,
    () =>
      t`Essay writing process flowchart, guiding students through brainstorming, outlining, drafting, and revising stages`,
  ],
  extract: [
    () =>
      t`Water evaporates from the Earth's surface, rises into the atmosphere and falls back down as precipitation. This water then runs off into rivers, lakes and oceans, where it again evaporates and is recycled back into the atmosphere.`,
  ],
};

function PromptSubmenu() {
  const [method, setMethod] = useState<"instruct" | "extract">("instruct");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [example, setExample] = useState(
    promptExamples.instruct[
      Math.floor(Math.random() * promptExamples.instruct.length)
    ]()
  );
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  // Choose a random example when the method changes
  useEffect(() => {
    const options = promptExamples[method];
    setExample(options[Math.floor(Math.random() * options.length)]());
  }, [method]);

  // Write the placeholder when the example changes
  useEffect(() => {
    if (!textareaRef.current) return;
    const chars = example.split("");
    let i = 0;
    // erase the current placeholder
    textareaRef.current.placeholder = "";
    intervalRef.current = setInterval(() => {
      if (!textareaRef.current) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      if (i >= chars.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      textareaRef.current.placeholder += chars[i];
      i++;
    }, 15);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [example]);

  // If the user focuses the textarea, set the placeholder to the complete example
  // and clear the interval
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.addEventListener("focus", () => {
      if (!textareaRef.current) return;
      textareaRef.current.placeholder = example;
      if (intervalRef.current) clearInterval(intervalRef.current);
    });
  }, [example]);

  return (
    <>
      <SmallLabel className="mt-3">
        <Trans>Method</Trans>
      </SmallLabel>
      <RadioGroup.Root
        value={method}
        name="method"
        onValueChange={(value) => setMethod(value as "instruct" | "extract")}
        className="justify-self-start"
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
        className="resize-none mt-2 text-base font-mono"
        rows={6}
        name="prompt"
        placeholder={placeholders[method]}
        ref={textareaRef}
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
        <div className="text-sm text-neutral-500 dark:text-neutral-300 leading-tight">
          {description}
        </div>
      </button>
    </RadioGroup.Item>
  );
}
const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > & { className?: string }
>(({ className = "", ...rest }, ref) => {
  return (
    <textarea
      ref={ref}
      data-testid="prompt-entry-textarea"
      className={`focus:shadow-inner leading-[1.3] bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:border-neutral-400 dark:focus:border-neutral-600 rounded p-4 text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-400 ${className}`}
      {...rest}
    />
  );
});

Textarea.displayName = "Textarea";

/*

Market understanding and competitive landscape maintenance for SaaS product development
Process for corporate social responsibility initiatives development and implementation across company operations
Supply chain analysis and optimization: cost reduction, efficiency improvement, and stakeholder collaboration
Essay writing process flowchart, guiding students through brainstorming, outlining, drafting, and revising stages

*/
