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
import { Link } from "react-router-dom";

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
    link: "/blog/post/ai-flowchart-generator",
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

const companies: { svg: string; name: string; className?: string }[] = [
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
    svg: "bbva.svg",
    name: "BBVA",
    className: "h-8 w-auto shrink-0",
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
  {
    svg: "technologico-de-monterrey.svg",
    name: "Tecnológico de Monterrey",
    className: "h-12 w-auto shrink-0 dark:invert",
  },
  // {
  //   svg: "ualaska.svg",
  //   name: "University of Alaska",
  //   className: "h-[90px] w-auto shrink-0 dark:invert",
  // },
  // {
  //   svg: "beijing-jiaotong.svg",
  //   name: "Beijing Jiaotong University",
  //   className: "h-[90px] w-auto shrink-0",
  // },
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
      <header className="relative bg-white dark:bg-[#0c0c0c] bg-gradient-to-b from-white to-purple-500/50 pt-12 dark:to-purple-900/50 dark:from-[#0c0c0c] border-b-2 border-b-purple-400/70 dark:border-purple-900/40">
        <img
          src="/images/arrows-purple.svg"
          draggable="false"
          className="absolute top-0 left-0 w-full h-full object-cover object-center opacity-5 dark:opacity-50"
          alt=""
        />
        <Container className="text-center grid relative">
          <span className="font-bold sm:text-lg mb-3">Flowchart Fun Pro</span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-wrap-balance font-bold !leading-tight mb-8">
            <Trans>Turn your ideas into professional diagrams in seconds</Trans>
          </h1>
          <p className="text-lg md:text-xl text-purple-500 font-bold text-wrap-balance leading-normal md:leading-tight text-center -mt-2 mb-10 dark:text-purple-100/70 dark:font-normal">
            <Trans>Upgrade to Pro for just $4/month</Trans>
          </p>
          <div
            ref={videoRef}
            className="pricing-video text-[0] bg-white max-w-xl w-full mx-auto rounded-2xl drop-shadow-xl shadow-neutral-900/50 overflow-hidden -mb-12 aspect-[1.3]"
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
      <div className="pricing-highlights pt-12">
        <div className="max-w-6xl mx-auto py-12 grid gap-12 px-4 md:px-8">
          <div>
            <SectionTitle>Features</SectionTitle>
            <div className="grid md:grid-cols-2 gap-4">
              {features().map((feature) => (
                <div
                  key={feature.title}
                  className="feature group relative overflow-hidden p-6 rounded-xl bg-neutral-100 border border-neutral-400/50 aspect-[2.5] flex items-center justify-center hover:bg-white hover:shadow-sm transition-colors dark:bg-neutral-900 dark:border-none dark:hover:bg-neutral-800"
                  style={
                    {
                      "--accent-color": "#fafa00",
                    } as CSSProperties
                  }
                >
                  <div className="grid gap-1 sm:gap-3 sm:group-hover:-translate-y-6 transition-transform z-10">
                    <h3 className="text-center text-[18px] sm:text-lg lg:text-xl font-bold text-foreground dark:text-neutral-300 text-wrap-balance leading-normal md:leading-tight dark:group-hover:text-white">
                      {feature.title}
                    </h3>
                    {feature.points.map((point) => (
                      <p
                        key={point}
                        className="text-center text-sm lg:text-base text-neutral-500 dark:text-neutral-400 text-wrap-balance !leading-normal"
                      >
                        {point}
                      </p>
                    ))}
                  </div>
                  <img
                    src={`images/pricing/${feature.imgPath}.svg`}
                    alt={feature.title}
                    className="pricing-feature-img h-[125px] w-[125px] dark:invert absolute bottom-[-50px] left-1/2 opacity-5 blur-[2px] sm:group-hover:opacity-100 group-hover:blur-0 group-hover:bottom-[-40px] transition-all duration-[400ms]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="trusted">
        <Container className="py-12">
          <SectionTitle className="text-center sm:mb-8">
            <Trans>Trusted by Professionals and Academics Alike</Trans>
          </SectionTitle>
          <div className="flex items-center gap-4 sm:gap-x-12 sm:gap-y-8 flex-wrap justify-center">
            {companies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-center"
              >
                <img
                  src={`/images/company_logos/${company.svg}`}
                  alt={company.name}
                  className={
                    company.className
                      ? company.className
                      : "h-12 w-auto shrink-0"
                  }
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
      <div className="whats-included py-12 px-4 md:px-8">
        <div className="md:w-max mx-auto">
          <SectionTitle>
            <Trans>What's Included</Trans>
          </SectionTitle>
          <div className="border-neutral-400/50 grid grid-cols-[minmax(0,1fr)_auto_auto] rounded-xl border shadow overflow-hidden bg-white dark:bg-neutral-900">
            <span>&nbsp;</span>
            <ColumnHeader>Pro</ColumnHeader>
            <ColumnHeader>Free</ColumnHeader>
            {pricingRows().map((row, i) => {
              const Icon = row.icon;
              return (
                <Fragment key={i}>
                  <Cell>
                    {row.link ? (
                      <Link
                        to={row.link}
                        className="flex items-center hover:text-purple-500"
                      >
                        <Icon
                          size={24}
                          weight="bold"
                          className="mr-3 hidden sm:inline -mt-[2px]"
                        />
                        {row.text}
                      </Link>
                    ) : (
                      <>
                        <Icon
                          size={24}
                          weight="bold"
                          className="mr-3 hidden sm:inline -mt-[2px]"
                        />
                        {row.text}
                      </>
                    )}
                  </Cell>
                  <Cell center available>
                    <Check
                      size={24}
                      weight="bold"
                      className="text-green-600 dark:text-green-500"
                    />
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
                        className="text-red-400 dark:text-red-600/50"
                      />
                    )}
                  </Cell>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <div className="checkout-wrapper py-14 relative overflow-hidden px-4 md:px-8">
        <div className="max-w-2xl mx-auto relative z-10">
          <Checkout pricing2 />
        </div>
        <img
          draggable="false"
          src="/images/arrows-purple.svg"
          className="absolute top-0 left-0 w-full object-cover object-center opacity-40 sm:opacity-20"
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
        "text-sm sm:text-base border-neutral-400/50 border-t border-neutral-200 py-2 sm:py-4 ",
        {
          "flex items-center justify-center border-l": center,
          "px-4 pr-10": !center,
          "bg-green-200 dark:bg-green-500/10": available,
          "bg-red-600/10 dark:bg-red-600/5": available === false,
        }
      )}
    >
      {center ? (
        children
      ) : (
        <p className="text-sm sm:text-base md:text-[18px] text-neutral-600 dark:text-neutral-400 text-wrap-balance leading-normal md:leading-tight">
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

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-xl font-bold text-purple-500 mb-4 dark:text-purple-400 ${className}`}
    >
      {children}
    </h2>
  );
}
