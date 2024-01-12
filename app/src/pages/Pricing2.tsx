import classNames from "classnames";
import { features } from "./Pricing";
import { Trans, t } from "@lingui/macro";
import { CSSProperties, Fragment, useEffect, useRef } from "react";
import {
  ChartBar,
  Check,
  ClockCounterClockwise,
  Eraser,
  FileArrowDown,
  FileArrowUp,
  FolderNotchOpen,
  Headset,
  LightbulbFilament,
  Microphone,
  Notification,
  Nut,
  PaintBrushBroad,
  ShareNetwork,
  X,
} from "phosphor-react";
import { Checkout } from "../components/Checkout";
import throttle from "lodash.throttle";

const pricingRows = () => [
  { text: t`Daily Sandbox Editor`, free: true, pro: true, icon: Eraser },
  {
    text: t`Theme Customization Editor`,
    free: true,
    pro: true,
    icon: PaintBrushBroad,
  },
  {
    text: t`Advanced Export Options (PNG, JPG, SVG)`,
    free: true,
    pro: true,
    icon: FileArrowUp,
  },
  { text: t`Rapid Deployment Templates`, free: true, pro: true, icon: Nut },
  {
    text: t`Unlimited Permanent Flowcharts`,
    free: false,
    pro: true,
    icon: ChartBar,
  },
  {
    text: t`AI-Powered Flowchart Creation`,
    free: false,
    pro: true,
    icon: LightbulbFilament,
  },
  {
    text: t`Voice-to-Diagram Dictation`,
    free: false,
    pro: true,
    icon: Microphone,
  },
  {
    text: t`Local File Support`,
    free: false,
    pro: true,
    icon: FolderNotchOpen,
  },
  {
    text: t`Watermark-Free Diagrams`,
    free: false,
    pro: true,
    icon: Notification,
  },
  {
    text: t`Data Import (Visio, Lucidchart, CSV)`,
    free: false,
    pro: true,
    icon: FileArrowDown,
  },
  {
    text: t`Custom Sharing Options`,
    free: false,
    pro: true,
    icon: ShareNetwork,
  },
  {
    text: t`Priority One-on-One Support`,
    free: false,
    pro: true,
    icon: Headset,
  },
  {
    text: t`Exclusive Office Hours`,
    free: false,
    pro: true,
    icon: ClockCounterClockwise,
  },
];

export default function Pricing2() {
  const videoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // bind to mouse move and capture the mouse position relative to the center of the video
    // write it onto custom properties on the video element
    const onMouseMove = (e: MouseEvent) => {
      if (!videoRef.current) return;
      const rect = videoRef.current.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      const x = e.clientX - center.x;
      const y = e.clientY - center.y;
      const width = rect.width;
      const height = rect.height;
      const offsetX = x / width;
      const offsetY = y / height;
      videoRef.current.style.setProperty("--mouse-x", offsetX.toString());
      videoRef.current.style.setProperty("--mouse-y", offsetY.toString());
    };

    const onMouseMoveThrottled = throttle(onMouseMove, 100);

    window.addEventListener("mousemove", onMouseMoveThrottled);

    return () => {
      window.removeEventListener("mousemove", onMouseMoveThrottled);
    };
  }, []);
  return (
    <div>
      <header className="bg-[#f6f5f6] dark:bg-[#0c0c0c] bg-gradient-to-b from-[#f6f5f6] to-purple-500/50 pt-12 dark:to-purple-900/50 dark:from-[#0c0c0c]">
        <Container className="text-center grid gap-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-wrap-balance font-bold !leading-tight">
            <Trans>
              Transform your Ideas into Professional Diagrams in Seconds
            </Trans>
          </h1>
          <p className="text-lg md:text-xl text-purple-500 font-bold text-wrap-balance leading-normal md:leading-tight text-center -mt-2 mb-2 dark:text-purple-100/70 dark:font-normal">
            <Trans>Complete access to all features for just $3/month!</Trans>
          </p>
          <div
            ref={videoRef}
            className="pricing-video max-w-xl w-full mx-auto rounded-2xl drop-shadow-xl shadow-neutral-900/50 overflow-hidden -mb-12"
            style={
              {
                "--mouse-x": 0,
                "--mouse-y": 0,
              } as CSSProperties
            }
          >
            <video autoPlay loop muted playsInline>
              <source
                src="https://res.cloudinary.com/tone-row/video/upload/v1696355335/duovvvtaihm85nx5kwlq.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </Container>
      </header>
      <div className="max-w-6xl mx-auto py-12 mt-12 grid gap-12 px-4 md:px-8">
        <div>
          <SectionTitle>Highlights</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            {features().map((feature) => (
              <div
                key={feature.title}
                className="feature group relative overflow-hidden p-6 rounded-xl bg-neutral-100 border border-neutral-400/50 aspect-[2.5] flex items-center justify-center hover:bg-white/50 transition-colors dark:bg-neutral-900/60 dark:border-neutral-700 dark:hover:bg-purple-900/60 dark:border-none"
              >
                <div className="grid gap-3 group-hover:-translate-y-6 transition-transform z-10">
                  <h3 className="text-center text-lg md:text-xl font-bold text-foreground dark:text-neutral-300 text-wrap-balance leading-normal md:leading-tight dark:group-hover:text-white">
                    {feature.title}
                  </h3>
                  {feature.points.map((point) => (
                    <p
                      key={point}
                      className="text-center text-base text-neutral-500 dark:text-neutral-400 text-wrap-balance !leading-normal"
                    >
                      {point}
                    </p>
                  ))}
                </div>
                <img
                  src={`images/pricing/${feature.imgPath}.svg`}
                  alt={feature.title}
                  className="h-[125px] w-[125px] absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 opacity-5 blur-[2px] group-hover:opacity-100 group-hover:blur-0 group-hover:bottom-[-40px] transition-all duration-[400ms]"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="md:w-max mx-auto">
          <SectionTitle>
            <Trans>What's Included</Trans>
          </SectionTitle>
          <div className="border-neutral-400/50 grid grid-cols-[minmax(0,1fr)_auto_auto] rounded-xl border shadow overflow-hidden">
            <span>&nbsp;</span>
            <ColumnHeader>Free</ColumnHeader>
            <ColumnHeader>Pro</ColumnHeader>
            {pricingRows().map((row, i) => {
              const Icon = row.icon;
              return (
                <Fragment key={i}>
                  <Cell>
                    <Icon
                      size={24}
                      weight="bold"
                      className="mr-2 hidden sm:inline"
                    />
                    {row.text}
                  </Cell>
                  <Cell center available={row.free}>
                    {row.free ? (
                      <Check
                        size={24}
                        weight="bold"
                        className="text-green-600 dark:text-green-500"
                      />
                    ) : (
                      <X
                        size={24}
                        weight="bold"
                        className="text-red-300 dark:text-red-600/50"
                      />
                    )}
                  </Cell>
                  <Cell center available>
                    <Check
                      size={24}
                      weight="bold"
                      className="text-green-600 dark:text-green-500"
                    />
                  </Cell>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <div className="checkout-wrapper py-12 relative overflow-hidden px-4 md:px-8">
        <div className="max-w-xl mx-auto relative z-10">
          <Checkout pricing2 />
        </div>
        <img
          src="/images/arrows-purple.svg"
          className="absolute top-0 left-0 w-full object-cover object-center opacity-20"
          alt=""
        />
      </div>
      <div className="bg-purple-700 text-white">
        <p className="text-center text-lg font-bold py-8 cursor-pointer">
          <Trans>Subscribe to Pro and flowchart the fun way!</Trans>
        </p>
      </div>
    </div>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-100 border-neutral-400/50 border-l text-center text-lg font-bold text-neutral-600 text-wrap-balance leading-normal md:leading-tight px-4 py-2 dark:bg-transparent dark:text-white">
      {children}
    </div>
  );
}

function Cell({
  children,
  center,
  available,
}: {
  children: React.ReactNode;
  center?: boolean;
  available?: boolean;
}) {
  return (
    <div
      className={classNames(
        "text-sm sm:text-base border-neutral-400/50 border-t border-neutral-200 py-2 sm:py-4",
        {
          "flex items-center justify-center border-l": center,
          "px-4 pr-10": !center,
          "bg-green-100 dark:bg-green-500/10": available,
          "bg-red-50 dark:bg-red-600/5": available === false,
        }
      )}
    >
      {center ? (
        children
      ) : (
        <p className="text-sm sm:text-base md:text-lg text-neutral-500 dark:text-neutral-400 text-wrap-balance leading-normal md:leading-tight">
          {children}
        </p>
      )}
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
        "max-w-3xl md:max-w-[974px] mx-auto px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-purple-500 mb-4">{children}</h2>;
}
