import classNames from "classnames";
import { Trans, t } from "@lingui/macro";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Checkout } from "../components/Checkout";
import FAQ from "../components/FAQ";
import { useFadeIn } from "../lib/useFadeIn";
import {
  Sparkle,
  Export,
  DownloadSimple,
  Lock,
  Check,
  Quotes,
} from "phosphor-react";

const companies: { svg: string; name: string; className?: string }[] = [
  {
    svg: "bbva.svg",
    name: "BBVA",
    className: "h-8 w-auto shrink-0",
  },
  {
    svg: "netflix.svg",
    name: "Netflix",
    className: "h-8 w-auto shrink-0",
  },
  {
    svg: "bytedance.svg",
    name: "Bytedance",
    className: "h-8 w-auto shrink-0 dark:invert",
  },
  {
    svg: "boston-dynamics.svg",
    name: "Boston Dynamics",
    className: "h-[55px] w-auto shrink-0",
  },
  {
    svg: "razer.svg",
    name: "Razer",
    className: "h-[55px] w-auto shrink-0",
  },
  {
    svg: "ucsd.svg",
    name: "UC San Diego",
    className: "h-9 w-auto shrink-0 dark:filter dark:brightness-[2]",
  },
  {
    svg: "utexas.svg",
    name: "University of Texas",
  },
  {
    svg: "sas-upenn.svg",
    name: "SAS UPenn",
    className: "h-[50px] w-auto shrink-0 dark:invert",
  },
];

const heroImages = [
  {
    alt: "Software architecture diagram with 8-12 nodes in slate blue and coral, showing app backend components in a clean hierarchy",
    rotate: "-2deg",
  },
  {
    alt: "Business process flow for customer onboarding with 6-8 steps including decision points, in deep teal with cream fills",
    rotate: "0deg",
  },
  {
    alt: "Colorful mind map of a product launch plan with branching categories in vibrant harmonious colors",
    rotate: "2deg",
  },
];

const outcomeCards = [
  {
    icon: Sparkle,
    title: () => t`Describe it and it appears`,
    body: () =>
      t`Tell the AI what you need in plain English. Your diagram builds itself in seconds.`,
  },
  {
    icon: Export,
    title: () => t`Always presentation-ready`,
    body: () =>
      t`Every diagram exports as crisp PNG, SVG, or shareable link — ready for the meeting, the doc, or the deck.`,
  },
  {
    icon: DownloadSimple,
    title: () => t`Import from anywhere`,
    body: () =>
      t`Pull in data from Visio, Lucidchart, CSV, or start from a template. No recreating what already exists.`,
  },
  {
    icon: Lock,
    title: () => t`Your work stays yours`,
    body: () =>
      t`Save locally, work offline, and control exactly who sees what. No data leaves your machine unless you say so.`,
  },
];

const freeBullets = [
  () => t`1 diagram at a time`,
  () => t`PNG & JPG export`,
  () => t`Theme editor`,
  () => t`Community templates`,
];

const proBullets = [
  () => t`Unlimited saved diagrams`,
  () => t`SVG, PDF & all export formats`,
  () => t`AI generation & editing`,
  () => t`Import from Visio, Lucidchart, CSV`,
  () => t`Custom sharing & public links`,
  () => t`Priority support`,
];

function CodeExample() {
  const g = "text-green-400";
  const p = "text-purple-400";
  const w = "text-neutral-200";
  return (
    <pre className="whitespace-pre">
      <span className={w}>User signs up</span>
      {"\n"}
      <span className={w}> Account created? </span>
      <span className={g}>.shape_diamond</span>
      {"\n"}
      <span className={w}> Yes </span>
      <span className={g}>.color_green</span>
      {"\n"}
      <span className={w}> Send welcome email</span>
      {"\n"}
      <span className={w}> Show dashboard</span>
      {"\n"}
      <span className={w}> No </span>
      <span className={g}>.color_red</span>
      {"\n"}
      <span className={w}> Show error message</span>
      {"\n"}
      <span className={w}> Retry</span>
      {"\n"}
      <span className={w}> </span>
      <span className={p}>(Account created?)</span>
    </pre>
  );
}

export default function Pricing2() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <header className="relative bg-white dark:bg-[#0c0c0c] bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/20 dark:to-[#0c0c0c] pt-12 pb-16 md:pt-16 md:pb-20 overflow-hidden">
        <img
          src="/images/arrows-purple.svg"
          draggable="false"
          className="absolute top-0 left-0 w-full h-full object-cover object-center opacity-[0.07] dark:opacity-30 pointer-events-none"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 40%)",
          }}
          alt=""
        />
        <Container className="text-center grid relative justify-items-center items-center gap-6 md:gap-8 mb-0">
          <span className="font-medium sm:text-[22px] text-blue-600 dark:text-blue-400 -mb-2">
            Flowchart Fun Pro
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-wrap-balance font-bold tracking-tight !leading-[1.25] text-neutral-900 dark:text-white">
            <Trans>Describe your idea. Get a diagram worth presenting.</Trans>
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl text-wrap-balance leading-relaxed">
            <Trans>
              The fastest way to turn what's in your head into something
              everyone else can understand.
            </Trans>
          </p>

          {/* Hero images — screenshots */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mt-4">
            {heroImages.map((img, i) => (
              <div
                key={i}
                className="w-[160px] h-[120px] sm:w-[220px] sm:h-[165px] md:w-[280px] md:h-[210px] rounded-xl overflow-hidden shadow-lg border-4 border-white dark:border-neutral-900 ring-1 ring-neutral-300 dark:ring-neutral-600"
                style={{ transform: `rotate(${img.rotate})` }}
              >
                <img
                  src={`/pricing-screenshots/${i + 1}.png`}
                  alt={img.alt}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:scale-[1.02] mt-4"
          >
            <Trans>Try it free</Trans>
          </Link>
        </Container>
      </header>

      {/* Logo Bar */}
      <FadeIn>
        <div className="py-10 md:py-14">
          <Container className="my-0">
            <p className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-6 uppercase tracking-wider">
              <Trans>Used at</Trans>
            </p>
            <div className="flex items-center gap-4 sm:gap-x-16 sm:gap-y-10 flex-wrap justify-center">
              {companies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center justify-center"
                >
                  <img
                    src={`/images/company_logos/${company.svg}`}
                    alt={company.name}
                    className={classNames(
                      "grayscale opacity-50 hover:grayscale-0 hover:opacity-80 transition-all duration-200",
                      company.className
                        ? company.className
                        : "h-12 w-auto shrink-0"
                    )}
                  />
                </div>
              ))}
            </div>
          </Container>
        </div>
      </FadeIn>

      {/* Pull Quote */}
      <FadeIn>
        <div className="py-16 md:py-24">
          <Container className="text-center relative my-0">
            <Quotes
              weight="fill"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 text-neutral-100 dark:text-neutral-800 pointer-events-none"
            />
            <blockquote className="relative z-10">
              <p className="text-xl sm:text-2xl md:text-3xl italic text-neutral-800 dark:text-neutral-200 font-medium text-wrap-balance leading-relaxed">
                &ldquo;
                <Trans>The beauty and magic reside in the minimalism.</Trans>
                &rdquo;
              </p>
              <footer className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                — sixti60, via Hacker News
              </footer>
            </blockquote>
          </Container>
        </div>
      </FadeIn>

      {/* Outcome Cards */}
      <FadeIn>
        <Container>
          <div className="grid md:grid-cols-2 gap-6">
            {outcomeCards.map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
              >
                <card.icon
                  size={28}
                  weight="duotone"
                  className="text-blue-600 dark:text-blue-400 mb-3"
                />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  <Trans>{card.title()}</Trans>
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <Trans>{card.body()}</Trans>
                </p>
              </div>
            ))}
          </div>
        </Container>
      </FadeIn>

      {/* Before/After Demo */}
      <FadeIn>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white text-center mb-8">
            <Trans>Type it. See it.</Trans>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Code block */}
            <div className="rounded-xl bg-neutral-900 dark:bg-neutral-950 p-5 text-sm font-mono leading-relaxed overflow-x-auto">
              <CodeExample />
            </div>
            {/* Diagram screenshot */}
            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 min-h-[200px]">
              <img
                src="/pricing-screenshots/4.png"
                alt="Flowchart diagram generated from the text input, showing a user signup flow with decision branches"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            <Trans>AI-generated from plain text in under 5 seconds.</Trans>
          </p>
        </Container>
      </FadeIn>

      {/* Free / Pro Comparison */}
      <FadeIn>
        <Container>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free card */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 flex flex-col">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Free
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">
                <Trans>See what's possible</Trans>
              </p>
              <ul className="grid gap-3 mb-8 flex-1">
                {freeBullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <Check
                      size={16}
                      weight="bold"
                      className="text-green-600 dark:text-green-400 shrink-0 mt-0.5"
                    />
                    <Trans>{bullet()}</Trans>
                  </li>
                ))}
              </ul>
              <Link
                to="/"
                className="block text-center rounded-full border-2 border-neutral-300 dark:border-neutral-600 px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                <Trans>Start for free</Trans>
              </Link>
            </div>
            {/* Pro card */}
            <div className="rounded-xl border-2 border-blue-600 bg-white dark:bg-neutral-900 p-8 flex flex-col">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                Pro — <Trans>$4/mo</Trans>
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 mb-6">
                <Trans>Make it yours</Trans>
              </p>
              <ul className="grid gap-3 mb-8 flex-1">
                {proBullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <Check
                      size={16}
                      weight="bold"
                      className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                    />
                    <Trans>{bullet()}</Trans>
                  </li>
                ))}
              </ul>
              <button
                className="block w-full text-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                onClick={() => {
                  document
                    .getElementById("checkout")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Trans>Upgrade to Pro</Trans>
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            <Trans>$24/year (save 50%) · Cancel anytime</Trans>
          </p>
        </Container>
      </FadeIn>

      {/* FAQ */}
      <FadeIn>
        <FAQ />
      </FadeIn>

      {/* Final CTA + Checkout */}
      <div id="checkout" className="scroll-mt-24">
        <Container className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
            <Trans>Your next diagram should be your best one.</Trans>
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400 mb-10">
            <Trans>Pro starts at $2/mo billed yearly. Cancel anytime.</Trans>
          </p>
        </Container>
        <div className="checkout-wrapper py-14 relative overflow-hidden px-4 md:px-6">
          <div className="max-w-2xl mx-auto relative z-10">
            <Checkout pricing2 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "max-w-3xl md:max-w-[974px] mx-auto px-6 my-12",
        className
      )}
    >
      {children}
    </div>
  );
}

function FadeIn({ children }: { children: ReactNode }) {
  const fadeIn = useFadeIn();
  return (
    <div ref={fadeIn.ref} className={fadeIn.className}>
      {children}
    </div>
  );
}
