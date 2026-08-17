import {
  ArrowSquareOut,
  BracketsAngle,
  MagnifyingGlass,
  PaintBucket,
  PhoneCall,
  UserGear,
} from "phosphor-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { ReactNode, useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import Spinner from "../components/Spinner";
import { Content, Close, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { BasicSelect } from "../ui/Select";
import {
  Button2,
  IconButton2,
  IconOutlineButton,
  IconToggleButton,
  Input,
  InputWithLabel,
  Notice,
  P,
  Page,
  Section,
  Textarea,
  Tooltip2,
} from "../ui/Shared";
import { Description, Label, PageTitle, SectionTitle } from "../ui/Typography";
import * as tokens from "../lib/designTokens";

/**
 * Internal design system page (route `/d`, hidden in production).
 *
 * Rules for this page:
 *  - Every primitive is IMPORTED from where it actually lives. Never
 *    re-implement a component here — the whole point is that the page cannot
 *    drift from the real thing.
 *  - Foundations read from `lib/designTokens.js`, the same file
 *    `tailwind.config.js` consumes, so the swatches cannot lie.
 *  - No <Trans> wrappers. This is an internal tool; translating it would
 *    pollute eight locale catalogs for no benefit.
 */
export default function DesignSystem() {
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.body.classList.contains("dark")
  );

  // Toggle dark mode for previewing. Restore on unmount so this page can never
  // leak its preview state into the rest of the app.
  useEffect(() => {
    const had = document.body.classList.contains("dark");
    document.body.classList.toggle("dark", dark);
    return () => {
      document.body.classList.toggle("dark", had);
    };
  }, [dark]);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>Design System — Flowchart Fun</title>
      </Helmet>
      <Page size="md" className="!max-w-5xl">
        <header className="grid gap-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <PageTitle>Design System</PageTitle>
            <Button2
              onClick={() => setDark((d) => !d)}
              color={dark ? "inverted" : "default"}
            >
              {dark ? "Switch to light" : "Switch to dark"}
            </Button2>
          </div>
          <Description size="base">
            Every element below is imported from where it lives in the app.
            Foundations read from <code>lib/designTokens.js</code>, the same
            file Tailwind consumes. If something looks wrong here, it is wrong
            everywhere.
          </Description>
        </header>

        <Foundations />
        <TypographySpecimens />
        <Buttons />
        <Forms />
        <FeedbackAndOverlays />
        <LayoutPrimitives />
        <Patterns />
      </Page>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Group({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Section className="!gap-5">
      <div className="grid gap-1">
        <SectionTitle>{title}</SectionTitle>
        {description ? <Description>{description}</Description> : null}
      </div>
      {children}
    </Section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label size="xs">{label}</Label>
      <div className="flex gap-2 items-center flex-wrap">{children}</div>
    </div>
  );
}

/** sRGB relative luminance → contrast ratio, so the swatches state their own
 * accessibility rather than making the reader guess. */
function contrast(hexA: string, hexB: string) {
  const lum = (hex: string) => {
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const [r, g, b] = [0, 2, 4].map((i) => {
      const v = parseInt(full.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(hexA), lum(hexB)];
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  return Math.round(ratio * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* 1. Foundations                                                      */
/* ------------------------------------------------------------------ */

function Ramp({ name, ramp }: { name: string; ramp: Record<string, string> }) {
  const stops = Object.entries(ramp).filter(([k]) => k !== "DEFAULT");
  return (
    <div className="grid gap-1.5">
      <Label size="xs">{name}</Label>
      <div className="flex flex-wrap gap-1.5">
        {stops.map(([stop, hex]) => {
          const onWhite = contrast(hex, "#ffffff");
          return (
            <div key={stop} className="grid gap-1 w-[76px]">
              <div
                className="h-12 rounded-md border border-neutral-200 dark:border-neutral-800"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {stop}
              </span>
              <span className="text-xs text-neutral-500 tabular-nums">
                {hex.toLowerCase()}
              </span>
              <span
                className={
                  onWhite >= 4.5
                    ? "text-xs text-green-700 dark:text-green-400 tabular-nums"
                    : "text-xs text-neutral-400 tabular-nums"
                }
                title="Contrast against white"
              >
                {onWhite.toFixed(2)}:1
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Foundations() {
  const { colors, fontSize, borderRadius, boxShadow, focusRing } = tokens;
  return (
    <Group
      title="Foundations"
      description="Colour ramps, type scale, radius, shadow and focus. Contrast figures are against white."
    >
      <div className="grid gap-6">
        <Ramp name="neutral" ramp={colors.neutral} />
        <Ramp name="blue" ramp={colors.blue} />
        <Ramp name="purple (Pro / pricing identity)" ramp={colors.purple} />
        <Ramp name="green" ramp={colors.green} />
        <Ramp name="orange" ramp={colors.orange} />
        <Ramp name="zinc" ramp={colors.zinc} />
        <div className="grid gap-1.5">
          <Label size="xs">page tokens</Label>
          <div className="flex gap-4 flex-wrap">
            {[
              ["background", colors.background],
              ["foreground", colors.foreground],
              ["focus ring", focusRing],
            ].map(([name, hex]) => (
              <div key={name} className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-md border border-neutral-200 dark:border-neutral-800 inline-block"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-sm">
                  {name}{" "}
                  <span className="text-neutral-500 tabular-nums">{hex}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <Label size="xs">type scale</Label>
        <div className="grid gap-3">
          {Object.entries(fontSize).map(([step, [size, opts]]) => (
            <div
              key={step}
              className="grid grid-cols-[64px_120px_1fr] gap-4 items-baseline border-b border-neutral-100 dark:border-neutral-800 pb-3"
            >
              <span className="text-xs font-medium text-neutral-500">
                {step}
              </span>
              <span className="text-xs text-neutral-400 tabular-nums">
                {size} / {opts.lineHeight}
                {opts.letterSpacing ? ` / ${opts.letterSpacing}` : ""}
              </span>
              <span
                style={{
                  fontSize: size,
                  lineHeight: opts.lineHeight,
                  letterSpacing: opts.letterSpacing,
                }}
              >
                Flowchart Fun
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-2 mt-2">
          <Label size="xs">
            display face (IBM Plex Sans) vs UI face (Inter)
          </Label>
          <span className="font-display text-3xl font-bold">
            Turn ideas into diagrams
          </span>
          <span className="font-sans text-3xl font-bold">
            Turn ideas into diagrams
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        <Label size="xs">radius</Label>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(borderRadius).map(([name, value]) => (
            <div key={name} className="grid gap-1 justify-items-center">
              <div
                className="w-16 h-16 bg-neutral-200 dark:bg-neutral-800"
                style={{ borderRadius: value }}
              />
              <span className="text-xs text-neutral-500">
                {name} · {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <Label size="xs">shadow</Label>
        <div className="flex gap-5 flex-wrap">
          {Object.keys(boxShadow).map((name) => (
            <div key={name} className="grid gap-2 justify-items-center">
              <div
                className={`w-20 h-16 rounded-lg bg-white dark:bg-neutral-900 shadow${
                  name === "DEFAULT" ? "" : `-${name}`
                }`}
              />
              <span className="text-xs text-neutral-500">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label size="xs">focus ring — tab to these</Label>
        <div className="flex gap-2">
          <Button2>Focusable</Button2>
          <Input placeholder="Focusable input" />
        </div>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Typography                                                       */
/* ------------------------------------------------------------------ */

function TypographySpecimens() {
  return (
    <Group title="Typography" description="ui/Typography.tsx">
      <div className="grid gap-4">
        <PageTitle>Page Title</PageTitle>
        <SectionTitle>Section Title (underlined, default)</SectionTitle>
        <SectionTitle isUnderline={false}>
          Section Title (no underline)
        </SectionTitle>
        <Description>
          Description, the default <code>sm</code> size. Body copy sits at a
          measure of roughly 65 characters — long enough to read, short enough
          not to lose the line. Lorem ipsum dolor sit amet, consectetur
          adipisicing elit, sed do eiusmod tempor incididunt ut labore.
        </Description>
        <Description size="base">
          Description at <code>base</code>.
        </Description>
        <div className="flex gap-4 items-baseline">
          <Label size="xs">Label xs</Label>
          <Label>Label sm (default)</Label>
          <Label size="base">Label base</Label>
        </div>
        <P>P — centred muted paragraph.</P>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Buttons                                                          */
/* ------------------------------------------------------------------ */

const BUTTON_COLORS = [
  "default",
  "blue",
  "purple",
  "green",
  "orange",
  "red",
  "zinc",
  "inverted",
] as const;

function Buttons() {
  return (
    <Group title="Buttons" description="ui/Shared.tsx">
      <Row label="Button2 — colors">
        {BUTTON_COLORS.map((color) => (
          <Button2 key={color} color={color}>
            {color}
          </Button2>
        ))}
      </Row>
      <Row label="Button2 — sizes">
        <Button2 size="xs">xs</Button2>
        <Button2 size="sm">sm (default)</Button2>
        <Button2 size="md">md</Button2>
        <Button2 size="lg">lg</Button2>
      </Row>
      <Row label="Button2 — states">
        <Button2>Default</Button2>
        <Button2 disabled>Disabled</Button2>
        <Button2 isLoading>Loading</Button2>
        <Button2 rounded>Rounded</Button2>
      </Row>
      <Row label="Button2 — icons">
        <Button2 leftIcon={<PhoneCall size={16} />}>Left icon</Button2>
        <Button2 rightIcon={<UserGear size={16} />}>Right icon</Button2>
        <Button2
          color="blue"
          leftIcon={<PaintBucket size={16} />}
          rightIcon={<ArrowSquareOut size={16} />}
        >
          Both
        </Button2>
      </Row>
      <Row label="IconButton2">
        {(["default", "blue", "zinc", "inverted"] as const).map((color) => (
          <IconButton2 key={color} color={color}>
            <PhoneCall size={16} />
          </IconButton2>
        ))}
        <IconButton2 disabled>
          <PhoneCall size={16} />
        </IconButton2>
        <IconButton2 isLoading>
          <PhoneCall size={16} />
        </IconButton2>
      </Row>
      <Row label="IconToggleButton / IconOutlineButton">
        <IconToggleButton>
          <MagnifyingGlass size={16} />
        </IconToggleButton>
        <IconToggleButton defaultPressed>
          <MagnifyingGlass size={16} />
        </IconToggleButton>
        <IconOutlineButton>
          <PhoneCall size={16} />
        </IconOutlineButton>
      </Row>
      <Row label="EditorActionTextButton (ui/EditorActionTextButton.tsx)">
        <EditorActionTextButton icon={BracketsAngle}>
          Learn Syntax
        </EditorActionTextButton>
      </Row>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Forms                                                            */
/* ------------------------------------------------------------------ */

function Forms() {
  return (
    <Group
      title="Forms"
      description="Every text control must render at ≥16px on mobile — Safari zooms the page otherwise."
    >
      <div className="grid gap-4 max-w-md">
        <div className="grid gap-2">
          <Label>Input</Label>
          <Input placeholder="Placeholder" />
        </div>
        <div className="grid gap-2">
          <Label>Input — loading</Label>
          <Input placeholder="Loading" isLoading />
        </div>
        <div className="grid gap-2">
          <Label>Input — disabled</Label>
          <Input placeholder="Disabled" disabled />
        </div>
        <div className="grid gap-2">
          <Label>Textarea</Label>
          <Textarea rows={3} placeholder="Multi-line" />
        </div>
        <div className="grid gap-2">
          <Label>InputWithLabel</Label>
          <InputWithLabel
            label="Email address"
            inputProps={{ type: "email" }}
          />
        </div>
        <div className="grid gap-2">
          <Label>BasicSelect (ui/Select.tsx)</Label>
          <div className="justify-self-start">
            <BasicSelect
              placeholder="Choose a layout…"
              options={[
                { label: "Dagre", value: "dagre" },
                { label: "Klay", value: "klay" },
                { label: "Layered", value: "layered" },
              ]}
            />
          </div>
        </div>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Feedback & overlays                                              */
/* ------------------------------------------------------------------ */

function FeedbackAndOverlays() {
  return (
    <Group title="Feedback & overlays">
      <Row label="Notice">
        <div className="grid gap-2 w-full max-w-md">
          <Notice>Warning notice — something needs attention.</Notice>
          <Notice style="info">Info notice — something worth knowing.</Notice>
        </div>
      </Row>
      <Row label="Spinner (components/Spinner.tsx)">
        <Spinner />
        <Spinner r={8} s={2} />
        <span className="text-blue-500">
          <Spinner r={10} s={2} />
        </span>
      </Row>
      <Row label="Tooltip2 — hover">
        <RadixTooltip.Provider>
          <Tooltip2 content="A short tooltip">
            <Button2>Hover me</Button2>
          </Tooltip2>
        </RadixTooltip.Provider>
      </Row>
      <Row label="Dialog (ui/Dialog.tsx)">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button2 color="blue">Open dialog</Button2>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Overlay />
            <Content>
              <Dialog.Title asChild>
                <SectionTitle isUnderline={false}>Dialog title</SectionTitle>
              </Dialog.Title>
              <Description>
                Dialog body copy. The close button sits top-right.
              </Description>
              <Close />
            </Content>
          </Dialog.Portal>
        </Dialog.Root>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button2>Open scrolling dialog</Button2>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Overlay />
            <Content overflowV maxWidthClass="max-w-[520px]">
              <Dialog.Title asChild>
                <SectionTitle isUnderline={false}>
                  Scrolling dialog (overflowV)
                </SectionTitle>
              </Dialog.Title>
              <Description>
                This variant carries the <code>ff-dialog</code> class that
                Sandbox.tsx watches to defer the upgrade prompt.
              </Description>
              {Array.from({ length: 14 }).map((_, i) => (
                <Description key={i}>Row {i + 1}</Description>
              ))}
              <Close />
            </Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Row>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Layout primitives                                                */
/* ------------------------------------------------------------------ */

function LayoutPrimitives() {
  return (
    <Group title="Layout" description="Page and Section from ui/Shared.tsx">
      <div className="grid gap-3">
        <Label size="xs">
          Page size=&quot;sm&quot; → max-w-xl gap-2 · size=&quot;md&quot; →
          max-w-3xl gap-10. This page uses md.
        </Label>
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
          <Section className="p-4">
            <SectionTitle isUnderline={false}>A Section</SectionTitle>
            <Description>Section is a grid with gap-4.</Description>
          </Section>
        </div>
      </div>
    </Group>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Patterns                                                         */
/* ------------------------------------------------------------------ */

/** Compositions that recur across pages but are NOT components yet. Having
 * them side by side is how the inconsistency becomes visible. */
function Patterns() {
  return (
    <Group
      title="Patterns"
      description="Recurring compositions that are not components yet. If one of these ends up used three times, promote it."
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label size="xs">Card surface (Settings, Feedback, Account)</Label>
          <div className="bg-white rounded-lg border border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 p-8">
            <Section>
              <SectionTitle>Language</SectionTitle>
              <Description>Card content sits inside Sections.</Description>
            </Section>
          </div>
        </div>

        <div className="grid gap-2">
          <Label size="xs">Segmented group (Settings GroupButton)</Label>
          <div className="flex gap-1">
            <Button2 className="!bg-blue-600 !text-white !opacity-100">
              Light Mode
            </Button2>
            <Button2 className="!bg-neutral-100 !text-neutral-600 dark:!bg-neutral-800 dark:!text-neutral-400">
              Dark Mode
            </Button2>
          </div>
        </div>

        <div className="grid gap-2">
          <Label size="xs">Editor tab bar</Label>
          <div className="grid grid-flow-col gap-1 justify-start">
            <span className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4 py-2.5 md:px-6 md:py-3 text-sm font-semibold rounded-t-lg shadow-sm">
              Document
            </span>
            <span className="bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-500 px-4 py-2.5 md:px-6 md:py-3 text-sm font-semibold rounded-t-lg">
              Theme
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label size="xs">Muted link list (Settings footer)</Label>
          <div className="grid gap-3 justify-start">
            {["Discord", "View on Github", "Privacy Policy"].map((l) => (
              <a
                key={l}
                href="#top"
                className="text-sm text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label size="xs">Empty state</Label>
          <div className="grid gap-3 justify-items-center text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg py-12 px-6">
            <SectionTitle isUnderline={false}>No charts yet</SectionTitle>
            <Description>Create one to get started.</Description>
            <Button2 color="blue">New chart</Button2>
          </div>
        </div>
      </div>
    </Group>
  );
}
