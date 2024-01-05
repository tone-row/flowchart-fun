import "./Header.css";

import { t } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  Chat,
  DiscordLogo,
  Folder,
  Gear,
  Info,
  Notebook,
  PencilLine,
  Plus,
  Signpost,
  TreeStructure,
  User,
  Lock,
  RocketLaunch,
} from "phosphor-react";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  forwardRef,
  LinkHTMLAttributes,
  memo,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";

import { DISCORD_URL } from "../lib/constants";
import { useIsLoggedIn, useIsProUser } from "../lib/hooks";
import { track } from "../lib/track";
import { useLastChart } from "../lib/useLastChart";
import { ReactComponent as BrandSvg } from "./brand.svg";

export const Header = memo(function SharedHeader() {
  const { pathname } = useLocation();
  const isSponsorPage = pathname === "/pricing";
  const isChartsPage = pathname === "/y";
  const isSettingsPage = pathname === "/s";
  const isAccountPage = pathname === "/a";
  const isFeedbackPage = pathname === "/o";
  const isLogInPage = pathname === "/l";
  const isBlogPage = pathname.includes("/blog");
  const isChangelogPage = pathname === "/changelog";
  const isRoadmapPage = pathname === "/roadmap";
  const isSignUpPage = pathname === "/i";
  const isNewPage = pathname === "/new";
  const isPrivacyPolicyPage = pathname === "/privacy-policy";
  const isSuccessPage = pathname === "/success";
  const isInfoPage = isBlogPage || isChangelogPage || isRoadmapPage;
  const isEditor =
    !isSponsorPage &&
    !isChartsPage &&
    !isFeedbackPage &&
    !isSettingsPage &&
    !isAccountPage &&
    !isInfoPage &&
    !isLogInPage &&
    !isSignUpPage &&
    !isNewPage &&
    !isSuccessPage;
  const isLoggedIn = useIsLoggedIn();
  const isProUser = useIsProUser();
  const lastChart = useLastChart((state) => state.lastChart);
  return (
    <>
      <NavigationMenu.Root asChild>
        <header className="grid-flow-col justify-between items-center px-2 py-1 hidden md:grid bg-[#f2f1f1]">
          <NavigationMenu.List asChild>
            <nav className="flex gap-1 items-center">
              <span className="shared-header__logo mr-2">
                <BrandSvg width={40} />
              </span>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`Editor`}
                  icon={<TreeStructure height={20} width={20} />}
                  aria-current={isEditor ? "page" : undefined}
                  to={lastChart}
                />
              </NavigationMenu.Item>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`New`}
                  icon={<Plus height={20} width={20} />}
                  className="shared-header__new"
                  aria-current={isNewPage ? "page" : undefined}
                  to="/new"
                />
              </NavigationMenu.Item>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`Charts`}
                  to="/y"
                  icon={<Folder height={20} width={20} />}
                  aria-current={isChartsPage ? "page" : undefined}
                />
              </NavigationMenu.Item>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`Feedback`}
                  icon={<Chat height={20} width={20} />}
                  aria-current={isFeedbackPage ? "page" : undefined}
                  to="/o"
                />
              </NavigationMenu.Item>
            </nav>
          </NavigationMenu.List>
          <NavigationMenu.List asChild>
            <nav className="flex items-center gap-1">
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <HeaderButton
                    label={t`Info`}
                    icon={<Info height={20} width={20} />}
                    aria-current={isInfoPage ? "page" : undefined}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown bg-neutral-50 shadow dark:bg-neutral-900"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Blog`}
                      aria-current={isBlogPage ? "page" : undefined}
                      icon={<PencilLine height={20} width={20} />}
                      to="/blog"
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      to="/changelog"
                      label={t`Changelog`}
                      aria-current={isChangelogPage ? "page" : undefined}
                      icon={<Notebook height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      to="/roadmap"
                      label={t`Roadmap`}
                      aria-current={isRoadmapPage ? "page" : undefined}
                      icon={<Signpost height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      to="/privacy-policy"
                      label={t`Privacy Policy`}
                      aria-current={isPrivacyPolicyPage ? "page" : undefined}
                      icon={<Lock height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <HeaderClientLink
                label={t`Settings`}
                icon={<Gear height={20} width={20} />}
                aria-current={isSettingsPage ? "page" : undefined}
                to="/s"
              />
              {isLoggedIn ? (
                <HeaderClientLink
                  label={t`Account`}
                  icon={<User height={20} width={20} />}
                  aria-current={isAccountPage ? "page" : undefined}
                  to="/a"
                />
              ) : (
                <HeaderClientLink
                  to="/l"
                  label={t`Log In`}
                  icon={<User height={20} width={20} />}
                  aria-current={isLogInPage ? "page" : undefined}
                />
              )}
              {!isProUser ? (
                <Link
                  to="/pricing"
                  data-testid="pro-link"
                  aria-current={isSponsorPage ? "page" : undefined}
                  className="font-bold text-[15px] rounded-lg py-1.5 ml-2 px-3 bg-purple-100 text-purple-500 hover:bg-purple-200 hover:text-purple-600 dark:bg-purple-900 dark:text-purple-400 dark:hover:bg-purple-800 dark:hover:text-purple-300"
                  onClick={() => {
                    track("sponsor", "click");
                  }}
                >
                  Try Flowchart Fun Pro
                </Link>
              ) : null}
            </nav>
          </NavigationMenu.List>
        </header>
      </NavigationMenu.Root>
      <MobileHeader
        isSponsorPage={isSponsorPage}
        isChartsPage={isChartsPage}
        isSettingsPage={isSettingsPage}
        isAccountPage={isAccountPage}
        isFeedbackPage={isFeedbackPage}
        isBlogPage={isBlogPage}
        isChangelogPage={isChangelogPage}
        isRoadmapPage={isRoadmapPage}
        isEditor={isEditor}
        isLogInPage={isLogInPage}
        isPrivacyPolicyPage={isPrivacyPolicyPage}
      />
    </>
  );
});

const btnClasses =
  "flex items-center gap-1 p-2 rounded text-[15px] text-neutral-700 hover:text-foreground hover:bg-white/40 dark:hover:bg-neutral-800 dark:aria-[current=page]:text-green-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-green-400";

type HeaderButtonProps = {
  label: string;
  icon: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

// forward ref
const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ label: children, icon, ...props }, ref) => {
    return (
      <button className={`${btnClasses}`} {...props} ref={ref}>
        <span className="shared-header-btn__icon">{icon}</span>
        <span>{children}</span>
      </button>
    );
  }
);

HeaderButton.displayName = "HeaderButton";

type HeaderClientLink = {
  label: string;
  icon?: ReactNode;
} & LinkProps;

const HeaderClientLink = forwardRef<HTMLAnchorElement, HeaderClientLink>(
  ({ label: children, icon, className = "", ...props }, ref) => {
    return (
      <Link className={`${btnClasses} ${className}`} {...props} ref={ref}>
        {icon && <span className="shared-header-btn__icon">{icon}</span>}
        <span>{children}</span>
      </Link>
    );
  }
);
HeaderClientLink.displayName = "HeaderClientLink";

type HeaderLinkProps = {
  label: string;
  icon: ReactNode;
  target?: string;
} & LinkHTMLAttributes<HTMLAnchorElement>;

const HeaderLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ label: children, icon, className = "", ...props }, ref) => {
    return (
      <a className={`${btnClasses} ${className}`} {...props} ref={ref}>
        <span className="shared-header-btn__icon">{icon}</span>
        <span>{children}</span>
      </a>
    );
  }
);

HeaderLink.displayName = "HeaderLink";

function MobileHeader({
  isSponsorPage,
  isChartsPage,
  isSettingsPage,
  isAccountPage,
  isFeedbackPage,
  isBlogPage,
  isChangelogPage,
  isRoadmapPage,
  isEditor,
  isLogInPage,
  isPrivacyPolicyPage,
}: {
  isSponsorPage: boolean;
  isChartsPage: boolean;
  isSettingsPage: boolean;
  isAccountPage: boolean;
  isFeedbackPage: boolean;
  isBlogPage: boolean;
  isChangelogPage: boolean;
  isRoadmapPage: boolean;
  isEditor: boolean;
  isLogInPage: boolean;
  isPrivacyPolicyPage: boolean;
}) {
  const lastChart = useLastChart((s) => s.lastChart);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isProUser = useIsProUser();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <>
      <Dialog.Root open={open}>
        <Dialog.Trigger asChild>
          <button
            onClick={() => setOpen(true)}
            className="mobile-header__toggle"
          >
            <BrandSvg width={40} />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className="mobile-header__overlay"
            onClick={() => {
              setOpen(false);
            }}
          />
          <Dialog.Content className="mobile-header__content">
            <HeaderClientLink
              label={t`Editor`}
              icon={<TreeStructure height={20} width={20} />}
              aria-current={isEditor ? "page" : undefined}
              to={lastChart}
            />
            <HeaderClientLink
              label={t`New`}
              icon={<Plus height={20} width={20} />}
              className="shared-header__new"
              to="/new"
            />
            <HeaderClientLink
              label={t`Charts`}
              to="/y"
              icon={<Folder height={20} width={20} />}
              aria-current={isChartsPage ? "page" : undefined}
            />
            <HeaderLink
              label="Discord"
              icon={<DiscordLogo height={20} width={20} />}
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-only"
            />
            <HeaderClientLink
              label={t`Feedback`}
              icon={<Chat height={20} width={20} />}
              aria-current={isFeedbackPage ? "page" : undefined}
              className="mobile-only"
              to="/o"
            />
            <HeaderClientLink
              to="/blog"
              label={t`Blog`}
              icon={<PencilLine height={20} width={20} />}
              aria-current={isBlogPage ? "page" : undefined}
            />
            <HeaderClientLink
              to="/changelog"
              label={t`Changelog`}
              icon={<Notebook height={20} width={20} />}
              aria-current={isChangelogPage ? "page" : undefined}
            />
            <HeaderClientLink
              to="/roadmap"
              label={t`Roadmap`}
              icon={<Signpost height={20} width={20} />}
              aria-current={isRoadmapPage ? "page" : undefined}
            />
            <HeaderClientLink
              label={t`Settings`}
              icon={<Gear height={20} width={20} />}
              aria-current={isSettingsPage ? "page" : undefined}
              to="/s"
            />
            {!isProUser ? (
              <HeaderClientLink
                to="/pricing"
                label={t`Upgrade to Pro`}
                icon={<RocketLaunch height={20} width={20} />}
                aria-current={isSponsorPage ? "page" : undefined}
                onClick={() => {
                  // track event with gtm
                  if (window?.dataLayer)
                    window.dataLayer.push({
                      event: "sponsor",
                      action: "click",
                      label: "mobile-header",
                    });
                }}
              />
            ) : null}
            {isLoggedIn ? (
              <HeaderClientLink
                label={t`Account`}
                icon={<User height={20} width={20} />}
                aria-current={isAccountPage ? "page" : undefined}
                to="/a"
              />
            ) : (
              <HeaderClientLink
                to="/l"
                label={t`Log In`}
                icon={<User height={20} width={20} />}
                aria-current={isLogInPage ? "page" : undefined}
              />
            )}
            <HeaderClientLink
              label={t`Privacy Policy`}
              icon={<Lock height={20} width={20} />}
              aria-current={isPrivacyPolicyPage ? "page" : undefined}
              className="mobile-only"
              to="/privacy-policy"
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
