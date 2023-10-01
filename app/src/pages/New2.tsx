import { Article, MagicWand, Plus } from "phosphor-react";
import { Button2, Input, Textarea } from "../ui/Shared";
import { templates } from "../lib/templates";
import { Trans } from "@lingui/macro";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Tabs from "@radix-ui/react-tabs";
import { useCallback, useContext, useState } from "react";
import { AppContext } from "../components/AppContext";
import { languages } from "../locales/i18n";
import { getFunFlowchartName } from "../lib/getFunFlowchartName";
import { useMutation } from "react-query";
import { supabase } from "../lib/supabaseClient";
import { getDefaultChart } from "../lib/getDefaultChart";
import { useUserId } from "../lib/hooks";
import { useNavigate } from "react-router-dom";

type CreateChartOptions = {
  name: string;
  template: string;
  promptType: string;
  subject?: string;
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

      let template = "",
        content = "";

      // Get Template
      if (options.template === "default") {
        const chart = getDefaultChart();
        const parts = chart.split("=====");
        content = parts[0];
        template = `=====${template}=====`;
      } else {
        const importTemplate = await import(
          `../lib/templates/${options.template}-template.ts`
        );
        content = importTemplate.content;
        template = importTemplate.template;
      }

      // Prompts
      if (options.subject) {
        setIsAI(true);
        const response = await fetch("/api/prompt/text", {
          method: "POST",
          body: JSON.stringify({
            promptType: options.promptType,
            subject: options.subject,
            accentClasses: templateData.accentClasses,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }).then((res) => res.json());
        // TO DO: Show Error Here
        if (response.text) {
          content = response.text;
        }
      }

      const chart = `${content}\n${template}`;

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

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const name = data.get("name")?.toString();
      const template = data.get("template")?.toString();
      const subject = data.get("subject")?.toString();
      if (!name || !template) return;

      const templateObj = templates.find((t) => t.key === template);
      if (!templateObj) return;

      const options: CreateChartOptions = {
        name,
        template,
        promptType: templateObj.promptType,
        subject,
      };

      createChartMutation.mutate(options);
    },
    [createChartMutation]
  );

  const language = useContext(AppContext).language;
  return (
    <form
      className="max-w-4xl mx-auto py-6 pt-10 px-4 w-full grid gap-12 content-start"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-bold md:mt-10 text-center">
        Create a New Chart
      </h1>
      <Section title="Name Chart">
        <Input
          placeholder="My Project"
          className="py-3"
          name="name"
          required
          defaultValue={getFunFlowchartName(language as keyof typeof languages)}
          data-1p-ignore
          disabled={createChartMutation.isLoading}
        />
      </Section>
      <Section title="Choose Template">
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
                  <div
                    className="p-2 h-[283px] rounded-sm border border-foreground/10 opacity-70 hover:opacity-100 group-data-[state=checked]:opacity-100 group-data-[state=checked]:border-foreground/30 overflow-hidden group-data-[state=checked]:shadow-sm"
                    style={{ backgroundColor: template.bgColor }}
                  >
                    <img
                      key={template.img}
                      src={`/templates/${template.img}`}
                      className="rounded w-full h-full object-contain object-center"
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
      <Section title="Set Content">
        <Tabs.Root defaultValue="default">
          <Tabs.List asChild>
            <div className="flex">
              <Trigger value="default" disabled={createChartMutation.isLoading}>
                <Article size={16} />
                <Trans>Default Content</Trans>
              </Trigger>
              <Trigger value="ai" disabled={createChartMutation.isLoading}>
                <MagicWand size={16} />
                <Trans>Use AI</Trans>
              </Trigger>
            </div>
          </Tabs.List>
          <Tabs.Content value="ai" className="pt-4 grid gap-2">
            <p className="text-neutral-700 leading-6 text-xs dark:text-neutral-300">
              Enter a prompt or information you would like to create a chart
              from. Click here to learn more about how this works.
            </p>
            <Textarea
              className="h-[120px]"
              name="subject"
              disabled={createChartMutation.isLoading}
            />
          </Tabs.Content>
        </Tabs.Root>
      </Section>
      <div className="grid justify-center justify-items-center gap-2">
        <Button2
          color="blue"
          leftIcon={<Plus size={16} />}
          type="submit"
          isLoading={createChartMutation.isLoading}
        >
          Create
        </Button2>
        {isAI && (
          <p className="text-neutral-700 leading-6 text-xs dark:text-neutral-300">
            This may take between 30 seconds and 2 minutes depending on the
            length of your prompt.
          </p>
        )}
      </div>
    </form>
  );
}

function Trigger(props: Parameters<typeof Tabs.Trigger>[0]) {
  return (
    <Tabs.Trigger
      className="pb-3 px-2 rounded-md rounded-none border-0 border-b-2 border-solid border-b-foreground/10 data-[state=active]:border-foreground text-foreground/40 data-[state=active]:text-foreground dark:border-b-neutral-800 dark:text-background/40 dark:data-[state=active]:text-white dark:data-[state=active]:border-white flex items-center gap-2"
      {...props}
    />
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-4">
      <h1 className="text-xl">{title}</h1>
      {children}
    </section>
  );
}
