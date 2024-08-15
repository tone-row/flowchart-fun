import { Plus, Rocket } from "phosphor-react";
import { Button2, Input } from "../ui/Shared";
import { templates } from "../lib/templates/templates";
import { Trans, t } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "../components/AppContextProvider";
import { languages } from "../locales/i18n";
import { getFunFlowchartName } from "../lib/getFunFlowchartName";
import { useMutation } from "react-query";
import { supabase } from "../lib/supabaseClient";
import { useHasProAccess, useUserId } from "../lib/hooks";
import { Link, useNavigate } from "react-router-dom";
import { showPaywall } from "../lib/usePaywallModalStore";
import {
  createUnlimitedContent,
  createUnlimitedTitle,
} from "../lib/paywallCopy";
import { Warning } from "../components/Warning";
import { FFTheme } from "../lib/FFTheme";
import { RequestTemplate } from "../components/RequestTemplate";

type CreateChartOptions = {
  name: string;
  template: string;
};

export default function New2() {
  // Whether we're using AI to generate the chart
  const [isAI, setIsAI] = useState(false);
  const userId = useUserId();
  const navigate = useNavigate();
  const createChartMutation = useMutation(
    async (options: CreateChartOptions) => {
      if (!userId) throw new Error("No user id");

      // Get Session Token
      if (!supabase) throw new Error("No supabase");
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("No Session");

      // Get Template
      const templateData = templates.find((t) => t.key === options.template);
      if (!templateData) throw new Error("No Template");

      // Get Template
      const importTemplate = await import(
        `../lib/templates/${options.template}-template.ts`
      );
      let content: string = importTemplate.content;
      const theme: FFTheme = importTemplate.theme;
      const cytoscapeStyle = importTemplate.cytoscapeStyle ?? "";

      const chart = `${content}\n=====${JSON.stringify({
        themeEditor: theme,
        cytoscapeStyle,
      })}=====`;

      return supabase
        .from("user_charts")
        .insert({ name: options.name, chart: chart, user_id: userId })
        .select();
    },
    {
      onSettled: () => {
        setIsAI(false);
      },
      onSuccess: (response: any) => {
        const chartId = response.data[0]?.id;
        if (chartId) navigate(`/u/${chartId}`);
      },
    }
  );

  const hasProAccess = useHasProAccess();
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!hasProAccess) {
        showPaywall({
          title: createUnlimitedTitle(),
          content: createUnlimitedContent(),
          toPricingCode: "New",
        });
        return;
      }
      const data = new FormData(e.currentTarget);
      const name = data.get("name")?.toString();
      const template = data.get("template")?.toString();
      if (!name || !template) return;

      const templateObj = templates.find((t) => t.key === template);
      if (!templateObj) return;

      const options: CreateChartOptions = {
        name,
        template,
      };

      createChartMutation.mutate(options);
    },
    [createChartMutation, hasProAccess]
  );

  const language = useContext(AppContext).language;

  return (
    <form
      className="max-w-4xl mx-auto py-6 pt-10 px-4 w-full grid gap-12 content-start"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-bold md:mt-10 text-center">
        <Trans>Create a New Chart</Trans>
      </h1>
      <Section title={t`Name Chart`}>
        <Input
          className="py-3"
          name="name"
          required
          defaultValue={getFunFlowchartName(language as keyof typeof languages)}
          data-1p-ignore
          disabled={createChartMutation.isLoading}
          aria-label={t`Name Chart`}
        />
      </Section>
      <Section title={t`Choose Template`} right={<RequestTemplate />}>
        <RadioGroup.Root asChild name="template" defaultValue="default">
          <div
            className="grid gap-x-2 gap-y-6 sm:grid-cols-2 md:grid-cols-3"
            aria-label="Templates"
          >
            {templates.map((template) => (
              <RadioGroup.Item
                key={template.key}
                value={template.key}
                asChild
                disabled={createChartMutation.isLoading}
              >
                <button className="grid gap-2 group focus:outline-foreground/10 focus:outline-2 outline-offset-4 rounded-md">
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                  <div className="h-[283px] text-[0px] rounded-sm border border-foreground/10 opacity-70 hover:opacity-100 group-data-[state=checked]:opacity-100 group-data-[state=checked]:border-foreground/30 overflow-hidden group-data-[state=checked]:shadow-sm">
                    <img
                      key={template.key}
                      src={`/template-screenshots/thumb_${template.key}.png`}
                      className="w-full h-full object-contain object-center"
                      alt={template.key}
                    />
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <span className="w-3 h-3 rounded-full border border-foreground/60 group-data-[state=checked]:border-foreground group-data-[state=checked]:bg-foreground dark:group-data-[state=checked]:bg-white dark:group-data-[state=checked]:border-white dark:border-background/50" />
                    <h2 className="text-center text-sm text-foreground/60 group-data-[state=checked]:text-foreground dark:text-background/60 dark:group-data-[state=checked]:text-white">
                      {template.title()}
                    </h2>
                  </div>
                </button>
              </RadioGroup.Item>
            ))}
          </div>
        </RadioGroup.Root>
      </Section>
      <div className="grid justify-center justify-items-center gap-2">
        {!hasProAccess && (
          <div className="justify-items-center grid">
            <Warning>
              <Link
                to="/pricing"
                className="flex items-center"
                data-to-pricing="New Page: Create Chart"
              >
                <Rocket size={24} className="mr-2" />
                <p>
                  <Trans>
                    You can create unlimited permanent flowcharts with{" "}
                    <span className="underline underline-offset-2">
                      Flowchart Fun Pro
                    </span>
                    .
                  </Trans>
                </p>
              </Link>
            </Warning>
          </div>
        )}
        <Button2
          color="blue"
          leftIcon={<Plus size={16} />}
          type="submit"
          isLoading={createChartMutation.isLoading}
          data-testid="Create Chart"
        >
          <Trans>Create</Trans>
        </Button2>
        {isAI && (
          <p className="text-neutral-700 leading-6 text-xs dark:text-neutral-300">
            <Trans>
              This may take between 30 seconds and 2 minutes depending on the
              length of your input.
            </Trans>
          </p>
        )}
      </div>
    </form>
  );
}

function Section({
  children,
  title,
  right,
}: {
  children: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1 sm:flex justify-between items-end">
        <h1 className="text-xl">{title}</h1>
        {right}
      </div>
      {children}
    </section>
  );
}
