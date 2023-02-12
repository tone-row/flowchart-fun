import "./Header.css";

import { t } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  Book,
  Chat,
  FolderOpen,
  Gear,
  Info,
  Lightning,
  Notebook,
  PencilLine,
  Plus,
  Question,
  Signpost,
  TreeStructure,
  User,
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

import { useIsValidCustomer } from "../lib/hooks";
import { track } from "../lib/track";
import { useLastChart } from "../lib/useLastChart";
import { ReactComponent as BrandSvg } from "./brand.svg";

export const Header = memo(function SharedHeader() {
  const { pathname } = useLocation();
  const isDocsPage = pathname === "/h";
  const isSponsorPage = pathname === "/pricing";
  const isChartsPage = pathname === "/y";
  const isHelpPage = pathname === "/h" || pathname === "/o";
  const isSettingsPage = pathname === "/s";
  const isAccountPage = pathname === "/a";
  const isFeedbackPage = pathname === "/o";
  const isLogInPage = pathname === "/l";
  const isBlogPage = pathname.includes("/blog");
  const isChangelogPage = pathname === "/changelog";
  const isRoadmapPage = pathname === "/roadmap";
  const isSignUpPage = pathname === "/i";
  const isNewPage = pathname === "/n";
  const isInfoPage = isBlogPage || isChangelogPage || isRoadmapPage;
  const isEditor =
    !isDocsPage &&
    !isSponsorPage &&
    !isChartsPage &&
    !isHelpPage &&
    !isSettingsPage &&
    !isAccountPage &&
    !isInfoPage &&
    !isLogInPage &&
    !isSignUpPage &&
    !isNewPage;
  const isValidCustomer = useIsValidCustomer();
  const lastChart = useLastChart((state) => state.lastChart);
  return (
    <>
      <NavigationMenu.Root asChild>
        <header className={`shared-header`}>
          <NavigationMenu.List asChild>
            <nav className="shared-header__left">
              <span className="shared-header__logo">
                <BrandSvg width={40} />
              </span>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`New`}
                  icon={<Plus weight="light" height={22} width={22} />}
                  className="shared-header__new"
                  aria-current={isNewPage ? "page" : undefined}
                  to="/n"
                />
              </NavigationMenu.Item>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`Editor`}
                  icon={<TreeStructure weight="light" height={22} width={22} />}
                  aria-current={isEditor ? "page" : undefined}
                  to={lastChart}
                />
              </NavigationMenu.Item>
              <NavigationMenu.Item asChild>
                <HeaderClientLink
                  label={t`Charts`}
                  to="/y"
                  icon={<FolderOpen weight="light" height={22} width={22} />}
                  aria-current={isChartsPage ? "page" : undefined}
                />
              </NavigationMenu.Item>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <HeaderButton
                    label={t`Help`}
                    aria-current={isHelpPage ? "page" : undefined}
                    icon={<Question weight="light" height={22} width={22} />}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Documentation`}
                      icon={<Book weight="light" height={22} width={22} />}
                      aria-current={isDocsPage ? "page" : undefined}
                      to="/h"
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Feedback`}
                      icon={<Chat weight="light" height={22} width={22} />}
                      aria-current={isFeedbackPage ? "page" : undefined}
                      to="/o"
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </nav>
          </NavigationMenu.List>
          <NavigationMenu.List asChild>
            <nav className="shared-header__right">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <HeaderButton
                    label={t`Info`}
                    icon={<Info weight="light" height={22} width={22} />}
                    aria-current={isInfoPage ? "page" : undefined}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Blog`}
                      icon={
                        <PencilLine weight="light" height={22} width={22} />
                      }
                      to="/blog"
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      to="/changelog"
                      label={t`Changelog`}
                      icon={<Notebook weight="light" height={22} width={22} />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      to="/roadmap"
                      label={t`Roadmap`}
                      icon={<Signpost weight="light" height={22} width={22} />}
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <HeaderClientLink
                label={t`Settings`}
                icon={<Gear weight="light" height={22} width={22} />}
                aria-current={isSettingsPage ? "page" : undefined}
                to="/s"
              />
              {isValidCustomer ? (
                <HeaderClientLink
                  label={t`Account`}
                  icon={<User weight="light" height={22} width={22} />}
                  aria-current={isAccountPage ? "page" : undefined}
                  to="/a"
                />
              ) : (
                <>
                  <HeaderClientLink
                    to="/pricing"
                    label={t`Pricing`}
                    icon={<Lightning weight="light" height={22} width={22} />}
                    aria-current={isSponsorPage ? "page" : undefined}
                    onClick={() => {
                      track("sponsor", "click");
                    }}
                  />
                  <HeaderClientLink
                    to="/l"
                    label={t`Log In`}
                    icon={<User weight="light" height={22} width={22} />}
                    aria-current={isLogInPage ? "page" : undefined}
                  />
                </>
              )}
            </nav>
          </NavigationMenu.List>
        </header>
      </NavigationMenu.Root>
      <MobileHeader
        isDocsPage={isDocsPage}
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
      />
    </>
  );
});

type HeaderButtonProps = {
  label: string;
  icon: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

// forward ref
const HeaderButton = forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ label: children, icon, className = "", ...props }, ref) => {
    return (
      <button
        className={`shared-header-btn ${className}`}
        aria-current
        {...props}
        ref={ref}
      >
        <span className="shared-header-btn__icon">{icon}</span>
        <span className="shared-header-btn__label">{children}</span>
      </button>
    );
  }
);

HeaderButton.displayName = "HeaderButton";

type HeaderClientLink = {
  label: string;
  icon: ReactNode;
} & LinkProps;

const HeaderClientLink = forwardRef<HTMLAnchorElement, HeaderClientLink>(
  ({ label: children, icon, className = "", ...props }, ref) => {
    return (
      <Link
        className={`shared-header-btn ${className}`}
        aria-current
        {...props}
        ref={ref}
      >
        <span className="shared-header-btn__icon">{icon}</span>
        <span className="shared-header-btn__label">{children}</span>
      </Link>
    );
  }
);
HeaderClientLink.displayName = "HeaderClientLink";

type HeaderLinkProps = {
  label: string;
  icon: ReactNode;
} & LinkHTMLAttributes<HTMLAnchorElement>;

const HeaderLink = forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ label: children, icon, className = "", ...props }, ref) => {
    return (
      <a
        className={`shared-header-btn ${className}`}
        aria-current
        {...props}
        ref={ref}
      >
        <span className="shared-header-btn__icon">{icon}</span>
        <span className="shared-header-btn__label">{children}</span>
      </a>
    );
  }
);

HeaderLink.displayName = "HeaderLink";

function MobileHeader({
  isDocsPage,
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
}: {
  isDocsPage: boolean;
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
}) {
  const lastChart = useLastChart((s) => s.lastChart);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isValidCustomer = useIsValidCustomer();

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
              label={t`New`}
              icon={<Plus weight="light" height={22} width={22} />}
              className="shared-header__new"
              to="/n"
            />
            <HeaderClientLink
              label={t`Editor`}
              icon={<TreeStructure weight="light" height={22} width={22} />}
              aria-current={isEditor ? "page" : undefined}
              to={lastChart}
            />
            <HeaderClientLink
              label={t`Charts`}
              to="/y"
              icon={<FolderOpen weight="light" height={22} width={22} />}
              aria-current={isChartsPage ? "page" : undefined}
            />
            <HeaderClientLink
              label={t`Documentation`}
              icon={<Book weight="light" height={22} width={22} />}
              aria-current={isDocsPage ? "page" : undefined}
              className="mobile-only"
              to="/h"
            />
            <HeaderClientLink
              label={t`Feedback`}
              icon={<Chat weight="light" height={22} width={22} />}
              aria-current={isFeedbackPage ? "page" : undefined}
              className="mobile-only"
              to="/o"
            />
            <HeaderClientLink
              to="/blog"
              label={t`Blog`}
              icon={<PencilLine weight="light" height={22} width={22} />}
              aria-current={isBlogPage ? "page" : undefined}
            />
            <HeaderClientLink
              to="/changelog"
              label={t`Changelog`}
              icon={<Notebook weight="light" height={22} width={22} />}
              aria-current={isChangelogPage ? "page" : undefined}
            />
            <HeaderClientLink
              to="/roadmap"
              label={t`Roadmap`}
              icon={<Signpost weight="light" height={22} width={22} />}
              aria-current={isRoadmapPage ? "page" : undefined}
            />
            <HeaderClientLink
              label={t`Settings`}
              icon={<Gear weight="light" height={22} width={22} />}
              aria-current={isSettingsPage ? "page" : undefined}
              to="/s"
            />
            {isValidCustomer ? (
              <HeaderClientLink
                label={t`Account`}
                icon={<User weight="light" height={22} width={22} />}
                aria-current={isAccountPage ? "page" : undefined}
                to="/a"
              />
            ) : (
              <>
                <HeaderClientLink
                  to="/pricing"
                  label={t`Pricing`}
                  icon={<Lightning weight="light" height={22} width={22} />}
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
                <HeaderClientLink
                  to="/l"
                  label={t`Log In`}
                  icon={<User weight="light" height={22} width={22} />}
                  aria-current={isLogInPage ? "page" : undefined}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
