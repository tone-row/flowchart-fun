import { t, Trans } from "@lingui/macro";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Check, X } from "phosphor-react";
import {
  RiEdit2Line,
  RiPaletteLine,
  RiLayoutMasonryLine,
  RiImageLine,
  RiFileList3Line,
  RiStackLine,
  RiBrainLine,
  RiHardDriveLine,
  RiWaterFlashLine,
  RiDownload2Line,
  RiShareLine,
  RiCustomerService2Line,
  RiTeamLine,
} from "react-icons/ri";

type Feature = {
  name: string;
  description: string;
  icon: typeof RiEdit2Line;
  free: boolean;
  link?: string;
  proLabel?: string;
};

const features: Feature[] = [
  {
    name: t`Daily Sandbox Editor`,
    description: t`Quick experimentation space that resets daily`,
    icon: RiEdit2Line,
    free: true,
  },
  {
    name: t`Theme Customization Editor`,
    description: t`Fine-tune layouts and visual styles`,
    icon: RiPaletteLine,
    free: true,
  },
  {
    name: t`Rapid Deployment Templates`,
    description: t`Start faster with use-case specific templates`,
    icon: RiLayoutMasonryLine,
    free: true,
  },
  {
    name: t`Raster Export (PNG, JPG)`,
    description: t`Perfect for docs and quick sharing`,
    icon: RiImageLine,
    free: true,
  },
  {
    name: t`Vector Export (SVG)`,
    description: t`High-quality exports with embedded fonts`,
    icon: RiFileList3Line,
    free: false,
  },
  {
    name: t`Unlimited Permanent Flowcharts`,
    description: t`Build your personal flowchart library`,
    icon: RiStackLine,
    free: false,
    proLabel: "Most Popular",
  },
  {
    name: t`AI-Powered Flowchart Creation`,
    description: t`Generate flowcharts from text automatically`,
    icon: RiBrainLine,
    free: false,
    link: "/blog/post/ai-flowchart-generator",
    proLabel: "Time-Saver",
  },
  {
    name: t`Watermark-Free Diagrams`,
    description: t`Export clean diagrams without branding`,
    icon: RiWaterFlashLine,
    free: false,
  },
  {
    name: t`Local File Support`,
    description: t`Keep your data private on your computer`,
    icon: RiHardDriveLine,
    free: false,
    proLabel: "Privacy",
  },
  {
    name: t`Data Import (Visio, Lucidchart, CSV)`,
    description: t`Import from popular diagram tools`,
    icon: RiDownload2Line,
    free: false,
  },
  {
    name: t`Custom Sharing Options`,
    description: t`Full-screen, read-only, and template sharing`,
    icon: RiShareLine,
    free: false,
    proLabel: "Collaboration",
  },
  {
    name: t`Priority One-on-One Support`,
    description: t`Get rapid responses to your questions`,
    icon: RiCustomerService2Line,
    free: false,
  },
  {
    name: t`Exclusive Office Hours`,
    description: t`Schedule personal consultation sessions`,
    icon: RiTeamLine,
    free: false,
    proLabel: "Support",
  },
];

const styles = {
  lightBorder: "border-neutral-400/50 dark:border-neutral-700",
  accentBorder: "border-blue-200 dark:border-blue-300/50",
  accentBorderBottom: "border-b-blue-200 dark:border-b-blue-300/50",
  accentBorderLeft: "border-l-blue-200 dark:border-l-blue-900/50",
  proBg:
    "bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900",
};

const proLabelColors = [
  "bg-green-600",
  "bg-blue-600",
  "bg-yellow-600",
  "bg-red-600",
  "bg-purple-600",
  "bg-orange-600",
  "bg-pink-600",
  "bg-gray-600",
];

export function FeatureBreakdown() {
  return (
    <div className="bg-white py-20 dark:bg-transparent">
      <div className="mx-auto max-w-4xl px-2 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            <Trans>Feature Breakdown</Trans>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400 text-balance leading-normal">
            <Trans>
              Compare our plans and find the perfect fit for your flowcharting
              needs
            </Trans>
          </p>
        </div>

        <div className="mt-12">
          {/* Table headers */}
          <div className="grid grid-cols-[auto_80px_80px]">
            <div
              className={classNames(
                "text-sm font-semibold text-neutral-900 dark:text-white py-3 pl-4 sm:pl-px border-b",
                {
                  [styles.lightBorder]: true,
                }
              )}
            >
              Features
            </div>
            <div
              className={classNames(
                "text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 py-3 border-b",
                {
                  [styles.lightBorder]: true,
                }
              )}
            >
              Free
            </div>
            <div
              className={classNames(
                "text-center text-sm font-bold text-white rounded-t-lg bg-gradient-to-r py-3",
                styles.proBg
              )}
            >
              Pro
            </div>
          </div>

          <div className="grid feature-breakdown-grid relative">
            {features.map((feature, index) => {
              const nextFeatureIsPro = features[index + 1]?.free;
              const proLabelIndex = feature.proLabel
                ? features.filter((f) => !!f.proLabel).indexOf(feature)
                : -1;
              return (
                <div
                  key={index}
                  className={classNames(
                    "grid grid-cols-[auto_80px_80px] border-l",
                    {
                      [styles.lightBorder]: feature.free,
                      [styles.accentBorderLeft]: !feature.free,
                      "bg-blue-500/[0.05] dark:bg-blue-500/30": !feature.free,
                    }
                  )}
                >
                  <div
                    className={classNames(
                      "flex items-center p-4 sm:p-5 border-b",
                      {
                        [styles.lightBorder]: nextFeatureIsPro,
                        [styles.accentBorder]: !nextFeatureIsPro,
                      }
                    )}
                  >
                    <feature.icon
                      className={classNames(
                        "h-6 w-6 mr-5 flex-shrink-0 hidden sm:block",
                        {
                          "text-neutral-400 dark:text-neutral-400":
                            feature.free,
                          "text-blue-500/90 dark:text-blue-400": !feature.free,
                        }
                      )}
                    />
                    <div>
                      <div className="flex items-center">
                        <p className="text-base font-medium text-foreground dark:text-white mb-1.5">
                          {feature.name}
                        </p>
                        {feature.proLabel && !feature.free && (
                          <span
                            className={classNames(
                              "ml-2 inline-flex -mt-2 items-center rounded-full text-white px-2.5 pt-[4px] pb-[4px] text-[12px] font-bold text-purple-800 hidden sm:block rotate-[-2deg] shadow-[3px_3px_0px_rgba(0,0,0,0.1)]",
                              proLabelColors[proLabelIndex]
                            )}
                          >
                            {feature.proLabel}
                          </span>
                        )}
                      </div>
                      <p
                        className={classNames(
                          "text-xs text-neutral-700 dark:text-neutral-300 leading-normal",
                          {
                            "!text-foreground/80 dark:!text-neutral-100":
                              !feature.free,
                          }
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={classNames(
                      "grid place-items-center border-b border-l",
                      styles.lightBorder,
                      {
                        [styles.accentBorderBottom]: !nextFeatureIsPro,
                        [styles.accentBorderLeft]: !feature.free,
                      }
                    )}
                  >
                    {feature.free ? (
                      <Check weight="bold" className="h-6 w-6 text-green-500" />
                    ) : (
                      <X
                        weight="bold"
                        className="h-6 w-6 text-neutral-700/20"
                      />
                    )}
                  </div>
                  <div
                    className={classNames(
                      "grid place-items-center py-3 border-b border-transparent",
                      {
                        [styles.proBg]: true,
                      }
                    )}
                  >
                    <Check
                      weight="bold"
                      className="h-5 w-5 text-white drop-shadow-sm drop-shadow-blue-900"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            <Trans>Get unlimited flowcharts and premium features</Trans>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-[1.02]"
            onClick={() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }}
          >
            <Trans>Upgrade to Pro</Trans>
          </Link>
        </div>
      </div>
    </div>
  );
}
