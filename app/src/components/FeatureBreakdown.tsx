import { Trans } from "@lingui/macro";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Check, X } from "phosphor-react";

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
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M19.045 7.401c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.378-.378-.88-.586-1.414-.586s-1.036.208-1.413.585L4 13.585V18h4.413L19.045 7.401zm-3-3 1.587 1.585-1.59 1.584-1.586-1.585 1.589-1.584zM6 16v-1.585l7.04-7.018 1.586 1.586L7.587 16H6zm-2 4h16v2H4z"
          fill="currentColor"
        />
      </svg>
    ),
    free: true,
  },
  {
    name: "Theme Customization Editor",
    description: "Fine-tune layouts and visual styles",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
          fill="currentColor"
        />
      </svg>
    ),
    free: true,
  },
  {
    name: "Rapid Deployment Templates",
    description: "Start faster with use-case specific templates",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"
          fill="currentColor"
        />
      </svg>
    ),
    free: true,
  },
  {
    name: "Raster Export (PNG, JPG)",
    description: "Perfect for docs and quick sharing",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"
          fill="currentColor"
        />
      </svg>
    ),
    free: true,
  },
  {
    name: "Vector Export (SVG)",
    description: "High-quality exports with embedded fonts",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 6h2v4h-2v-4z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Pro Quality",
  },
  {
    name: "Unlimited Permanent Flowcharts",
    description: "Build your personal flowchart library",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15.5h-2V14h-2v-2h4v6.5zM15 15h2V5h-2v10zm-4 0V5H9v10h2z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Most Popular",
  },
  {
    name: "AI-Powered Flowchart Creation",
    description: "Generate flowcharts from text automatically",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-11h2v6h-2V8zm0 8h2v2h-2v-2z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    link: "/blog/post/ai-flowchart-generator",
    proLabel: "Time-Saver",
  },
  {
    name: "Local File Support",
    description: "Keep your data private on your computer",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Privacy",
  },
  {
    name: "Watermark-Free Diagrams",
    description: "Export clean diagrams without branding",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Professional",
  },
  {
    name: "Data Import (Visio, Lucidchart, CSV)",
    description: "Import from popular diagram tools",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Compatibility",
  },
  {
    name: "Custom Sharing Options",
    description: "Full-screen, read-only, and template sharing",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Collaboration",
  },
  {
    name: "Priority One-on-One Support",
    description: "Get rapid responses to your questions",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Support",
  },
  {
    name: "Exclusive Office Hours",
    description: "Schedule personal consultation sessions",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z"
          fill="currentColor"
        />
      </svg>
    ),
    free: false,
    proLabel: "Premium",
  },
];

export default function FeatureBreakdown() {
  return (
    <div className="bg-white py-16 dark:bg-neutral-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            <Trans>Feature Breakdown</Trans>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            <Trans>
              Compare our plans and find the perfect fit for your flowcharting
              needs
            </Trans>
          </p>
        </div>

        <div className="mt-12">
          {/* Table headers */}
          <div className="grid grid-cols-[auto_80px_80px] border-b border-neutral-200 dark:border-neutral-700">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              Features
            </div>
            <div className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Free
            </div>
            <div className="text-center text-sm font-bold text-purple-700 dark:text-purple-400 rounded-t-lg bg-purple-50 dark:bg-purple-900/20 py-2 -mb-2">
              Pro
            </div>
          </div>

          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {features.map((feature, index) => (
              <div
                key={index}
                className={classNames(
                  "grid grid-cols-[auto_80px_80px]",
                  !feature.free && "bg-purple-50/50 dark:bg-purple-900/5"
                )}
              >
                <div className="flex items-center p-4">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0" />
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

                <div className="grid place-items-center">
                  {feature.free ? (
                    <Check weight="bold" className="h-5 w-5 text-green-500" />
                  ) : (
                    <X
                      weight="bold"
                      className="h-5 w-5 text-neutral-300 dark:text-neutral-600"
                    />
                  )}
                </div>
                <div className="grid place-items-center bg-purple-50 dark:bg-purple-900/20 py-3">
                  <Check weight="bold" className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            <Trans>Get unlimited flowcharts and premium features</Trans>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300"
          >
            <Trans>Upgrade to Pro</Trans>
          </Link>
        </div>
      </div>
    </div>
  );
}
