import { t, Trans } from "@lingui/macro";
import { Asterisk, Check } from "phosphor-react";
import { ReactNode } from "react";

import { PaymentStepper } from "../components/PaymentStepper";
import { Box } from "../slang";
import { ReactComponent as BlockChain } from "./BlockChain.svg";
import styles from "./Pricing.module.css";

const features = (): {
  title: string;
  points: string[];
  imgPath: string;
}[] => [
  {
    title: t`Import from Lucidchart, Visio, and other CSV files`,
    points: [
      t`Easily import existing flowcharts from other software`,
      t`Save time and streamline your workflow by importing data from other sources`,
    ],
    imgPath: "ArtificialIntelligence",
  },
  {
    title: t`Create Flowcharts from a Prompt with AI`,
    points: [
      t`Use AI to create flowcharts from data sets or algorithms`,
      t`Save time and automate certain tasks with this cutting-edge feature`,
    ],
    imgPath: "AI",
  },
  {
    title: t`One-on-One Support`,
    points: [
      t`Get personalized attention and support from our expert team`,
      t`Have complex questions or issues? We're here to help.`,
    ],
    imgPath: "Date",
  },
  {
    title: t`Export High-Resolution Images`,
    points: [
      t`Create professional-quality visual aids for presentations or training materials`,
      t`Impress your audience with high-quality images produced by Flowchart Fun`,
    ],
    imgPath: "Learning",
  },
];

const plans = () => [
  {
    title: t`Free`,
    key: "free",
    features: [
      t`Temporary Flowcharts`,
      t`Image Export`,
      `8 ${t`Auto-Layouts`}`,
      t`One-time Share Links`,
    ],
  },
  {
    title: `Flowchart Fun Pro`,
    key: "pro",
    features: [
      t`Everything in Free`,
      t`Persistent Flowcharts`,
      t`Remove Image Watermark`,
      t`Export High-Resolution Images`,
      t`Export to SVG`,
      t`Import from Lucidchart, Visio, and other CSV files`,
      `13 ${t`Auto-Layouts`}`,
      t`Permalinks`,
      t`Custom Sharing Options`,
      t`Create Flowcharts from a Prompt with AI`,
      t`One-on-One Support`,
      t`Office Hours`,
    ],
  },
];

export default function Pricing() {
  return (
    <div className="grid content-start">
      <div className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto items-center mt-16 mb-6 md:mb-20 px-4">
        <Box gap={6} className="left" items="start">
          <p
            className="text-3xl md:text-4xl font-medium text-neutral-800 leading-tight dark:text-neutral-100"
            data-testid={`pricing-page-title`}
          >
            <Trans>
              Unleash your creativity and streamline your workflow with
              Flowchart Fun Pro – starting at just $3/month!
            </Trans>
          </p>
        </Box>
        <div
          className={`${styles.video} shadow-md border border-neutral-300 rounded-lg dark:border-neutral-700`}
        >
          <video autoPlay loop muted playsInline className="dark:invert">
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="pb-10">
        <div className="grid md:gap-8 md:grid-cols-2 max-w-[878px] mx-auto w-full px-4">
          {features().map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
      <div className="py-6 md:py-10 bg-gradient-to-b from-blue-100 to-blue-50 px-4 dark:from-blue-600/40 dark:to-blue-600/30">
        <div className="grid md:grid-flow-col justify-center gap-6 md:gap-10 items-start">
          {plans().map((props) => (
            <Plan {...props} key={props.key} />
          ))}
        </div>
      </div>
      <PaymentStepper />
      <div
        className={`pt-16 pb-20 px-4 text-neutral-800 ${styles.footer} bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-600/40 dark:to-blue-600/30 dark:text-neutral-50`}
      >
        <div className="max-w-[660px] mx-auto grid justify-items-center grid gap-4">
          <BlockChain
            className="text-neutral-900/90 dark:text-neutral-100/90"
            width={160}
            height={160}
          />
          <p className="text-lg md:text-xl text-center font-bold leading-tight">
            <Trans>
              Streamline your workflow and simplify your process visualization
              with Flowchart Fun. Subscribe now and take advantage of our
              powerful Pro features!
            </Trans>
          </p>
        </div>
      </div>
    </div>
  );
}

function Plan({ title, features }: ReturnType<typeof plans>[0]) {
  return (
    <div className="grid gap-4 p-8 rounded-lg bg-white shadow-lg shadow-blue-200 text-foreground dark:bg-[#0f0f0f] dark:shadow-none">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mt-[-3px] dark:text-neutral-100">
        {title}
      </h2>
      <div className="grid gap-2">
        {features.map((feature) => (
          <div className="flex items-center gap-2 opacity-80" key={feature}>
            <Check
              size={22}
              className="text-green-600 translate-y-[1px]"
              weight="bold"
            />
            <span className="text-base font-medium dark:text-neutral-100">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubsectionDescription({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-start grid-cols-[16px_minmax(0,1fr)] gap-3 opacity-70">
      <Asterisk className="w-[16px] mt-[4px]" />
      <p className="text-sm leading-normal">{children}</p>
    </div>
  );
}

function Feature({
  title,
  points,
  imgPath,
}: ReturnType<typeof features>[number]) {
  return (
    <div className="px-7 py-4 md:py-10 rounded-lg grid justify-items-center content-center gap-2 md:border border-neutral-400 dark:border-neutral-800">
      <div className="bg-white rounded-full w-[120px] h-[120px] mb-4">
        <img
          src={`images/pricing/${imgPath}.svg`}
          alt={title}
          className="w-[120px]"
        />
      </div>
      <h2 className="text-xl font-bold text-neutral-800 leading-tight text-center mb-4 dark:text-neutral-300 text-wrap-balance">
        {title}
      </h2>
      <div className="grid gap-3">
        {points.map((point) => (
          <SubsectionDescription key={point}>{point}</SubsectionDescription>
        ))}
      </div>
    </div>
  );
}
