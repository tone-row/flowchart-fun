import { t, Trans } from "@lingui/macro";
import * as Collapsible from "@radix-ui/react-collapsible";
import { CaretDown } from "phosphor-react";
import { ReactNode, useState } from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

type FAQItem = {
  question: string;
  answer: string;
  extra?: ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: t`Will my diagrams actually look professional?`,
    answer: t`Yes. Every diagram uses balanced, automatic layouts with clean typography. You can customize themes, colors, and styles — and export as crisp SVG or high-resolution PNG that looks great in any presentation or document.`,
  },
  {
    question: t`How fast can I actually make something?`,
    answer: t`Under 60 seconds. Type a few lines of text or describe what you need to the AI, and your diagram appears instantly. Export or share it with one click.`,
  },
  {
    question: t`Can I import my existing diagrams?`,
    answer: t`Yes. Pro supports importing from Visio, Lucidchart, and CSV — so you can bring in what you already have without recreating it from scratch.`,
  },
  {
    question: t`What if I just need it for one project?`,
    answer: t`The free plan works great for day-to-day use. If you need Pro features, it's month-to-month at $4/mo — cancel anytime with no commitment.`,
  },
  {
    question: t`Is my data private?`,
    answer: t`Yes. You can save and load files locally, work entirely offline, and control exactly who sees your diagrams. No data leaves your machine unless you choose to share.`,
  },
  {
    question: t`Do you offer discounts for students or nonprofits?`,
    answer: t`Yes — send us a message and we'll set you up with a discounted rate.`,
    extra: (
      <Link
        to="/o"
        className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
      >
        <Trans>Send us a message</Trans>
      </Link>
    ),
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-4 sm:py-28 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          <Trans>Frequently Asked Questions</Trans>
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-normal text-balance">
          <Trans>Everything you need to know about Flowchart Fun Pro</Trans>
        </p>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq, index) => (
          <Collapsible.Root
            key={index}
            open={openItems.includes(`faq-${index}`)}
            onOpenChange={() => toggleItem(`faq-${index}`)}
            className={classNames(
              "rounded-lg border border-neutral-200 dark:border-neutral-800",
              "bg-white dark:bg-neutral-900",
              "transition-all duration-200 ease-in-out",
              "hover:border-blue-200 dark:hover:border-blue-800"
            )}
          >
            <Collapsible.Trigger className="w-full p-6 flex justify-between items-center text-left">
              <span className="text-lg font-medium text-neutral-900 dark:text-white">
                {faq.question}
              </span>
              <CaretDown
                className={classNames(
                  "h-5 w-5 text-neutral-500 dark:text-neutral-400 transition-transform duration-200",
                  {
                    "transform rotate-180": openItems.includes(`faq-${index}`),
                  }
                )}
              />
            </Collapsible.Trigger>
            <Collapsible.Content className="overflow-hidden transition-all data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
              <div className="p-6 pt-0 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {faq.answer}
                {faq.extra && <div className="mt-2">{faq.extra}</div>}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>
    </div>
  );
}
