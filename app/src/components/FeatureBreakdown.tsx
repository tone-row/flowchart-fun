import { Trans } from "@lingui/macro";
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
  icon: React.ComponentType<{ className?: string }>;
  free: boolean;
  link?: string;
  proLabel?: string;
};

const features: Feature[] = [
  {
    name: "Daily Sandbox Editor",
    description: "Quick experimentation space that resets daily",
    icon: RiEdit2Line,
    free: true,
  },
  {
    name: "Theme Customization Editor",
    description: "Fine-tune layouts and visual styles",
    icon: RiPaletteLine,
    free: true,
  },
  {
    name: "Rapid Deployment Templates",
    description: "Start faster with use-case specific templates",
    icon: RiLayoutMasonryLine,
    free: true,
  },
  {
    name: "Raster Export (PNG, JPG)",
    description: "Perfect for docs and quick sharing",
    icon: RiImageLine,
    free: true,
  },
  {
    name: "Vector Export (SVG)",
    description: "High-quality exports with embedded fonts",
    icon: RiFileList3Line,
    free: false,
    proLabel: "Pro Quality",
  },
  {
    name: "Unlimited Permanent Flowcharts",
    description: "Build your personal flowchart library",
    icon: RiStackLine,
    free: false,
    proLabel: "Most Popular",
  },
  {
    name: "AI-Powered Flowchart Creation",
    description: "Generate flowcharts from text automatically",
    icon: RiBrainLine,
    free: false,
    link: "/blog/post/ai-flowchart-generator",
    proLabel: "Time-Saver",
  },
  {
    name: "Local File Support",
    description: "Keep your data private on your computer",
    icon: RiHardDriveLine,
    free: false,
    proLabel: "Privacy",
  },
  {
    name: "Watermark-Free Diagrams",
    description: "Export clean diagrams without branding",
    icon: RiWaterFlashLine,
    free: false,
    proLabel: "Professional",
  },
  {
    name: "Data Import (Visio, Lucidchart, CSV)",
    description: "Import from popular diagram tools",
    icon: RiDownload2Line,
    free: false,
    proLabel: "Compatibility",
  },
  {
    name: "Custom Sharing Options",
    description: "Full-screen, read-only, and template sharing",
    icon: RiShareLine,
    free: false,
    proLabel: "Collaboration",
  },
  {
    name: "Priority One-on-One Support",
    description: "Get rapid responses to your questions",
    icon: RiCustomerService2Line,
    free: false,
    proLabel: "Support",
  },
  {
    name: "Exclusive Office Hours",
    description: "Schedule personal consultation sessions",
    icon: RiTeamLine,
    free: false,
    proLabel: "Premium",
  },
];

export function FeatureBreakdown() {
  return (
    <div className="bg-white py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
            <div className="text-sm font-semibold text-neutral-900 dark:text-white py-2 border-b border-neutral-200">
              Features
            </div>
            <div className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400 py-2 border-b border-neutral-200">
              Free
            </div>
            <div className="text-center text-sm font-bold text-white rounded-t-lg bg-gradient-to-r from-purple-500 to-purple-600 py-2">
              Pro
            </div>
          </div>

          <div className="grid feature-breakdown-grid relative">
            {features.map((feature, index) => {
              const nextFeatureIsPro = features[index + 1]?.free;
              return (
                <div
                  key={index}
                  className={classNames(
                    "grid grid-cols-[auto_80px_80px] border-l border-neutral-200",
                    {
                      "bg-purple-500/[0.05] dark:bg-purple-900/5 border-purple-100":
                        !feature.free,
                    }
                  )}
                >
                  <div
                    className={classNames("flex items-center p-5 border-b", {
                      "border-neutral-200": nextFeatureIsPro,
                      "border-purple-100": !nextFeatureIsPro,
                    })}
                  >
                    <feature.icon
                      className={classNames("h-6 w-6 mr-5 flex-shrink-0", {
                        "text-neutral-600 dark:text-neutral-400": feature.free,
                        "text-purple-600 dark:text-purple-400": !feature.free,
                      })}
                    />
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {feature.name}
                        </p>
                        {feature.proLabel && !feature.free && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                            {feature.proLabel}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={classNames(
                      "grid place-items-center border-b border-neutral-200",
                      {
                        "border-purple-100": !nextFeatureIsPro,
                      }
                    )}
                  >
                    {feature.free ? (
                      <Check weight="bold" className="h-6 w-6 text-green-500" />
                    ) : (
                      <X
                        weight="bold"
                        className="h-6 w-6 text-neutral-400/50 dark:text-neutral-600"
                      />
                    )}
                  </div>
                  <div className="grid place-items-center bg-gradient-to-r from-purple-500 to-purple-600 dark:bg-purple-900/20 py-3 border-b border-transparent">
                    <Check weight="bold" className="h-5 w-5 text-white" />
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
            className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300"
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
