import { t, Trans } from "@lingui/macro";
import { Check, Minus } from "phosphor-react";
import { ReactNode } from "react";

import styles from "./Pricing.module.css";

import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import classNames from "classnames";
import { PaymentStepper } from "../components/PaymentStepper";

const posthogToken = process.env.REACT_APP_PUBLIC_POSTHOG_KEY;
const posthogApiHost = process.env.REACT_APP_PUBLIC_POSTHOG_HOST;
if (posthogToken && posthogApiHost) {
  posthog.init(posthogToken, {
    api_host: posthogApiHost,
  });
}

const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
};

const features = (): {
  title: string;
  points: string[];
  imgPath: string;
}[] => [
  {
    title: t`Unlimited Flowcharts`,
    points: [
      t`Flowchart Fun Pro allows you to create, store, and distribute as many flowcharts as you need.`,
    ],
    imgPath: "launch",
  },
  {
    title: t`Create with AI`,
    points: [
      t`Begin with a prompt like Customer Support Flowchart and Flowchart Fun will create a flowchart for you!`,
    ],
    imgPath: "AI",
  },
  {
    title: t`Direct from your Data`,
    points: [
      t`Produce flowcharts directly from your data. Import from Lucidchart, Visio, and other CSV files.`,
    ],
    imgPath: "ArtificialIntelligence",
  },
  {
    title: t`No Watermarks`,
    points: [
      t`Export professional-quality flowcharts without watermarks to use in your presentations and documents`,
    ],
    imgPath: "Congratulations",
  },
];

const plans = () => [
  {
    title: t`Free`,
    key: "free",
    features: [
      t`1 Sandbox Flowchart`,
      t`PNG & JPG Exports`,
      t`Watermarked Images`,
    ],
    isPro: false,
  },
  {
    title: `Flowchart Fun Pro`,
    key: "pro",
    features: [
      t`Unlimited Permanent Flowcharts`,
      t`PNG, JPG, and SVG Exports`,
      t`No Watermark!`,
      t`Data Import`,
      t`Custom Sharing Options`,
      t`Create Flowcharts from a Prompt with AI`,
      t`One-on-One Support`,
      t`Office Hours`,
    ],
    isPro: true,
  },
];

function Pricing() {
  return (
    <div className="grid content-start">
      <div className="grid md:grid-cols-2 gap-12 max-w-[1100px] mx-auto items-center mt-16 mb-6 md:mb-12 px-4">
        <div className="left grid gap-6 text-center">
          <p
            className="text-wrap-balance font-bold text-xl sm:text-2xl md:text-4xl leading-tight"
            data-testid={`pricing-page-title`}
          >
            <Trans>
              Visualize Your Ideas in a Flash with{" "}
              <span className="relative whitespace-nowrap text-blue-600">
                Flowchart Fun Pro
              </span>
            </Trans>
          </p>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 text-wrap-balance leading-normal md:leading-tight">
            <Trans>Create unlimited diagrams for just $3/month!</Trans>
          </p>
        </div>
        <div
          className={`${styles.video} shadow-lg border border-neutral-300 rounded-lg dark:border-neutral-700 dark:border-0 dark:shadow-none bg-black`}
        >
          <video autoPlay loop muted playsInline>
            <source
              src="https://res.cloudinary.com/tone-row/video/upload/v1696355335/duovvvtaihm85nx5kwlq.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
      <div className="pt-12 pb-6 bg-neutral-100 dark:bg-blue-900/50">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 max-w-[870px] xl:max-w-[1250px] mx-auto w-full px-4">
          {features().map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
      <div className="py-6 md:py-8 md:pb-16 px-4">
        <div className="grid md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_auto_minmax(0,1fr)] gap-6 md:gap-8 items-start justify-center md:justify-start w-full max-w-5xl md:max-w-[1200px] mx-auto">
          {plans().map((props) => (
            <Plan {...props} key={props.key} />
          ))}
          <PaymentStepper />
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-800/50 dark:to-blue-900/50 text-lg md:text-2xl text-center text-white p-8 font-bold">
        <p>
          {/* <Trans>
            Visualize your ideas— <em className="text-shadow">instantly</em>.
          </Trans> */}
          <span className="font-bold mt-1 block">
            Subscribe to Pro and flowchart the fun way!
          </span>
        </p>
      </div>
      {/* <div className={`${styles.footer} py-20 dark:bg-blue-600/0`}>
        <h3 className="mt-6 text-xl max-w-3xl mx-auto text-center leading-[1.5] text-wrap-balance text-blue-500">
          <Foo />
          <Trans>Drag-and-drop can be a drag</Trans>
          <span className="font-bold mt-1 block">
            Subscribe to Pro and flowchart the fun way!
          </span>
        </h3>
      </div> */}
    </div>
  );
}

export default function PricingProvider() {
  return (
    <PostHogProvider apiKey={posthogToken} options={options}>
      <Pricing />
    </PostHogProvider>
  );
}

function Plan({ title, features, isPro }: ReturnType<typeof plans>[0]) {
  return (
    <div
      className={classNames(
        "grid gap-4 text-foreground dark:bg-transparent pl-8 py-4",
        {
          "lg:border-l-2 border-neutral-200 dark:border-neutral-800 md:pl-16":
            isPro,
          "hidden lg:block": !isPro,
        }
      )}
    >
      <h2
        className={classNames(
          "text-lg sm:text-xl md:text-2xl md:mb-3 mt-[-3px] dark:text-neutral-50",
          {
            "font-bold text-blue-600": isPro,
          }
        )}
      >
        {title}
      </h2>
      <div className="grid gap-2">
        {features.map((feature) => (
          <div
            className="flex items-center gap-2 opacity-80 dark:opacity-90 -ml-8"
            key={feature}
          >
            {isPro ? (
              <Check
                className="text-green-600 translate-y-[1px] w-4 h-4 flex-shrink-0 sm:w-6 sm:h-6"
                weight="bold"
              />
            ) : (
              <Minus
                className="text-yellow-500 translate-y-[1px] w-4 h-4 flex-shrink-0 sm:w-6 sm:h-6"
                weight="bold"
              />
            )}
            <span className="text-xs sm:text-base font-medium dark:text-neutral-50">
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
    <div className="opacity-70 dark:opacity-80">
      <p className="text-sm leading-normal text-center text-wrap-balance max-w-[300px]">
        {children}
      </p>
    </div>
  );
}

function Feature({
  title,
  points,
  imgPath,
}: ReturnType<typeof features>[number]) {
  return (
    <div className="px-6 rounded grid grid-rows-[125px_auto_120px] justify-items-center content-center dark:text-neutral-50 lg:px-2">
      <div>
        <img
          src={`images/pricing/${imgPath}.svg`}
          alt={title}
          className="h-[125px] w-[125px] dark:invert"
        />
      </div>
      <h2 className="text-xl text-neutral-800 leading-[1.3] my-4 text-center dark:text-neutral-100 text-wrap-balance">
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
