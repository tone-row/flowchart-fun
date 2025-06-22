import { Plus, Rocket } from "phosphor-react";
import { Button2, Input } from "../ui/Shared";
import { templates } from "shared";
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
import { analytics } from "../lib/analyticsService";

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
      onSuccess: (response: any, variables: CreateChartOptions) => {
        const chartId = response.data[0]?.id;
        
        // Track flowchart creation
        analytics.trackFlowchartCreated({
          template: variables.template,
          name: variables.name,
          source: 'new_page',
          user_type: hasProAccess ? 'pro' : 'free',
          is_first_chart: false, // Could be enhanced with actual first chart detection
        });
        
        // Track template usage
        analytics.trackTemplateUsed(variables.template, {
          user_type: hasProAccess ? 'pro' : 'free',
          chart_id: chartId,
        });
        
        if (chartId) navigate(`/u/${chartId}`);
      },
      onError: (error: any, variables: CreateChartOptions) => {
        // Track creation failure
        analytics.trackError(
          error.message || 'Failed to create flowchart',
          'flowchart_creation',
          {
            template: variables.template,
            user_type: hasProAccess ? 'pro' : 'free',
          }
        );
      },
    }
  );

  const hasProAccess = useHasProAccess();
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      
      if (!hasProAccess) {
        // Track paywall shown
        analytics.trackPaywallShown('flowchart_creation', {
          attempted_template: data.get("template")?.toString(),
          attempted_name: data.get("name")?.toString(),
        });
        
        showPaywall({
          title: createUnlimitedTitle(),
          content: createUnlimitedContent(),
          toPricingCode: "New",
        });
        return;
      }
      const name = data.get("name")?.toString();
      const template = data.get("template")?.toString();
      if (!name || !template) return;

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
                key={template}
                value={template}
                asChild
                disabled={createChartMutation.isLoading}
              >
                <button className="grid gap-2 group focus:outline-foreground/10 focus:outline-2 outline-offset-4 rounded-md">
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                  <div className="h-[283px] text-[0px] rounded-sm border border-foreground/10 opacity-70 hover:opacity-100 group-data-[state=checked]:opacity-100 group-data-[state=checked]:border-foreground/30 overflow-hidden group-data-[state=checked]:shadow-sm">
                    <img
                      key={template}
                      src={`/template-screenshots/thumb_${template}.png`}
                      className="w-full h-full object-contain object-center"
                      alt={template}
                    />
                  </div>
                  <div className="flex gap-2 items-center justify-center mt-2">
                    <span className="w-3 h-3 rounded-full border border-foreground/60 group-data-[state=checked]:border-foreground group-data-[state=checked]:bg-foreground dark:group-data-[state=checked]:bg-white dark:group-data-[state=checked]:border-white dark:border-background/50" />
                    <h2 className="text-xs text-foreground/60 group-data-[state=checked]:text-foreground dark:text-background/60 dark:group-data-[state=checked]:text-white font-mono tracking-wide">
                      {template}
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
