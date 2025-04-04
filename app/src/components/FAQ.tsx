import { Trans } from "@lingui/macro";
import * as Collapsible from "@radix-ui/react-collapsible";
import { CaretDown } from "phosphor-react";
import { useState } from "react";
import classNames from "classnames";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "Do you have a free trial?",
    answer:
      "While we don't offer a free trial, our pricing is designed to be as accessible as possible, especially for students and educators. At just $4 for a month, you can explore all the features and decide if it's right for you. Feel free to subscribe, try it out, and re-subscribe whenever you need.",
  },
  {
    question: "How does AI flowchart generation work?",
    answer:
      "Our AI creates diagrams from your text prompts, allowing for seamless manual edits or AI-assisted adjustments. Unlike others, our Pro plan offers unlimited AI generations and edits, empowering you to create without limits.",
  },
  {
    question: "Are there usage limits?",
    answer:
      "No, there are no usage limits with the Pro plan. Enjoy unlimited flowchart creation and AI features, giving you the freedom to explore and innovate without restrictions.",
  },
  {
    question: "Are my flowcharts private?",
    answer:
      "Yes, your cloud flowcharts are accessible only when you're logged in. Additionally, you can save and load files locally, perfect for managing sensitive work-related documents offline.",
  },
  {
    question: "Do you offer a non-profit discount?",
    answer:
      "Yes, we support non-profits with special discounts. Contact us with your non-profit status to learn more about how we can assist your organization.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Canceling is easy. Simply go to your account page, scroll to the bottom, and click cancel. If you're not completely satisfied, we offer a refund on your first payment.",
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
    <div className="max-w-3xl mx-auto py-16 px-4 sm:py-24 sm:px-6">
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
              "hover:border-purple-200 dark:hover:border-purple-800"
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
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ))}
      </div>
    </div>
  );
}
