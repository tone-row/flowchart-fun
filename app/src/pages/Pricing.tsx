import { t, Trans } from "@lingui/macro";
import {
  Check,
  Sparkle,
  MagicWand,
  DownloadSimple,
  LockKey,
  IconProps,
} from "phosphor-react";
import { ReactNode, ComponentType } from "react";

import styles from "./Pricing.module.css";

import classNames from "classnames";
import { Checkout } from "../components/Checkout";

export const features = (): {
  title: string;
  points: string[];
  imgPath: string;
  icon: ComponentType<IconProps>;
}[] => [
  {
    title: t`Unlimited Flowcharts`,
    points: [
      t`Create unlimited flowcharts stored in the cloud– accessible anywhere!`,
    ],
    imgPath: "launch",
    icon: Sparkle,
  },
  {
    title: t`AI Creation & Editing`,
    points: [
      t`Save time with AI and dictation, making it easy to create diagrams.`,
    ],
    imgPath: "AI",
    icon: MagicWand,
  },
  {
    title: t`Connect your Data`,
    points: [
      t`Use Lucidchart or Visio? CSV Import makes it easy to get data from any source!`,
    ],
    imgPath: "Performance-Chart",
    icon: DownloadSimple,
  },
  {
    title: t`Keep Things Private`,
    points: [
      t`With the pro version you can save and load local files. It's perfect for managing work-related documents offline.`,
    ],
    imgPath: "Code-Script",
    icon: LockKey,
  },
];

const plans = () => [
  {
    title: t`Free`,
    key: "free",
    features: [
      t`1 Temporary Flowchart`,
      t`Theme Editor`,
      t`Export to PNG & JPG`,
      t`Rapid Templates`,
      t`Watermarks`,
    ],
    isPro: false,
  },
  {
    title: `Flowchart Fun Pro`,
    key: "pro",
    features: [
      t`Unlimited Permanent Flowcharts`,
      t`Local File Support`,
      t`Theme Editor`,
      t`Export to PNG, JPG, and SVG`,
      t`Rapid Templates`,
      t`No Watermarks!`,
      t`Import from Visio, Lucidchart, and CSV`,
      t`Create Flowcharts using AI`,
      t`Custom Sharing Options`,
      t`One on One Support`,
      t`Office Hours`,
    ],
    isPro: true,
  },
];

export default function Pricing() {
  return (
    <div className="grid content-start">
      <div className="grid md:grid-cols-2 gap-12 max-w-[1100px] mx-auto items-center mt-16 mb-6 md:mb-12 px-4">
        <div className="left grid gap-6 text-center">
          <p
            className="text-wrap-balance font-bold text-xl sm:text-2xl md:text-4xl leading-tight"
            data-testid={`pricing-page-title`}
          >
            <Trans>
              Transform Your Ideas into Professional Diagrams in Seconds
            </Trans>
          </p>
          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 text-wrap-balance leading-normal md:leading-tight">
            <Trans>Create unlimited diagrams for just $6/month!</Trans>
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
      <div className="pt-12 pb-6 bg-gradient-to-b from-blue-500/0 to-blue-500/10 dark:bg-blue-900/10">
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
          <Checkout />
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
    </div>
  );
}

function Plan({ title, features, isPro }: ReturnType<typeof plans>[0]) {
  return (
    <div
      className={classNames("grid gap-2 dark:bg-transparent pl-8 py-4", {
        "lg:border-l-2 border-neutral-200 dark:border-neutral-800 md:pl-16":
          isPro,
        "hidden lg:grid": !isPro,
        "text-blue-600 dark:text-white": isPro,
      })}
    >
      <h2
        className={classNames(
          "text-lg sm:text-xl md:text-2xl md:mb-3 mt-[-3px]"
        )}
      >
        {title}
      </h2>
      <div className="grid gap-2">
        {features.map((feature) => (
          <div
            className="flex items-center gap-2 opacity-80 dark:opacity-90"
            key={feature}
          >
            {isPro ? (
              <div className="w-6 h-6 flex-shrink-0 bg-blue-100 rounded flex items-center justify-center dark:bg-blue-500/20">
                <Check className="text-blue-600" weight="bold" />
              </div>
            ) : (
              <Check className="text-blue-600" weight="bold" />
            )}
            <span
              className={classNames("text-xs sm:text-base font-medium", {
                "text-blue-700 dark:text-white !font-bold": isPro,
              })}
            >
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
      <h2 className="text-lg font-bold text-neutral-800 leading-[1.3] my-4 text-center dark:text-neutral-100 text-wrap-balance">
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
