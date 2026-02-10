import { Trans } from "@lingui/macro";
import { RiDoubleQuotesL } from "react-icons/ri";

import classNames from "classnames";
import { testimonials, icons } from "../lib/socialProof";

type TestimonialProps = {
  quote: string;
  username: string;
  avatar?: string;
  url: string;
  site: keyof typeof icons;
  index: number;
};

// Color scheme for different sites
const siteColorScheme: Record<string, { text: string; darkText: string }> = {
  producthunt: {
    text: "text-[#FF6154]",
    darkText: "dark:text-[#FF6154]",
  },
  hackernews: {
    text: "text-[#FF6600]",
    darkText: "dark:text-[#FF6600]",
  },
  reddit: {
    text: "text-[#FF4500]",
    darkText: "dark:text-[#FF4500]",
  },
};

// Rotating colors for avatar placeholder backgrounds
const avatarColors = ["bg-blue-500", "bg-blue-400", "bg-orange-500"];

function Testimonial({
  quote,
  username,
  avatar,
  url,
  site,
  index,
}: TestimonialProps) {
  const SiteIcon = icons[site];
  const colorScheme = siteColorScheme[site];
  const avatarColor = avatarColors[index % avatarColors.length];
  const firstLetter = username.charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800/50 flex flex-col justify-between h-full overflow-hidden max-w-md w-full m-2">
      <div className="p-6 relative">
        <span className="absolute -top-4 left-6 text-7xl opacity-[0.05] text-blue-700 dark:text-blue-400 dark:opacity-[0.15] -ml-10 mt-4 select-none">
          <RiDoubleQuotesL />
        </span>

        <div className="flex justify-end mb-5">
          <div
            className={classNames(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
              colorScheme.text,
              colorScheme.darkText
            )}
          >
            <SiteIcon size={14} className="flex-shrink-0" />
            <span className="capitalize">{site}</span>
          </div>
        </div>

        <blockquote className="relative z-10">
          <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base !leading-normal relative">
            {quote}
          </p>
        </blockquote>
      </div>

      <div className="mt-auto border-t border-neutral-200/80 dark:border-neutral-800/50 p-4 flex items-center bg-neutral-50/80 dark:bg-neutral-900/60">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-9 h-9 rounded-full mr-3 object-cover ring-2 ring-white/80 dark:ring-neutral-800/80 flex-shrink-0"
          />
        ) : (
          <div
            className={`w-9 h-9 ${avatarColor} rounded-full flex items-center justify-center mr-3 text-white font-medium text-base shadow-sm flex-shrink-0`}
          >
            {firstLetter}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-xs text-neutral-700 dark:text-neutral-300 mr-2 break-words">
              {username}
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-400 transition-colors ml-auto flex-shrink-0"
              aria-label={`View original post on ${site}`}
            >
              <SiteIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <div className="py-16 md:py-20 overflow-hidden relative bg-gradient-to-b from-white to-neutral-50 dark:from-transparent dark:to-neutral-900 dark:bg-neutral-900/20">
      <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-10">
        <div
          className="absolute -inset-40 bg-center bg-no-repeat bg-[length:100px_100px]"
          style={{ backgroundImage: 'url("/images/arrows-purple.svg")' }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            <Trans>What our users are saying</Trans>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-normal text-balance">
            <Trans>Join thousands of happy users who love Flowchart Fun</Trans>
          </p>
        </div>

        <div className="flex flex-wrap justify-center">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              quote={testimonial.quote}
              username={testimonial.username}
              avatar={testimonial.avatar}
              url={testimonial.url}
              site={testimonial.site}
              index={index}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://www.producthunt.com/products/flowchart-fun"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300"
          >
            <Trans>See more reviews on Product Hunt</Trans>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
