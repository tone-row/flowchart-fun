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
  Notebook,
  PencilLine,
  Plus,
  Question,
  Signpost,
  Star,
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

import { gaChangeTab, gaNewChart } from "../lib/analytics";
import { useIsValidCustomer } from "../lib/hooks";
import { useLastChart } from "../lib/useLastChart";
import { ReactComponent as BrandSvg } from "./brand.svg";

export const SharedHeader = memo(function SharedHeader() {
  const { pathname } = useLocation();
  const isDocsPage = pathname === "/h";
  const isSponsorPage = pathname === "/sponsor";
  const isChartsPage = pathname === "/y";
  const isHelpPage = pathname === "/h" || pathname === "/o";
  const isSettingsPage = pathname === "/s";
  const isAccountPage = pathname === "/a";
  const isFeedbackPage = pathname === "/o";
  const isEditor =
    !isDocsPage &&
    !isSponsorPage &&
    !isChartsPage &&
    !isHelpPage &&
    !isSettingsPage &&
    !isAccountPage;
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
                  icon={<Plus height={20} width={20} />}
                  className="shared-header__new"
                  to="/n"
                  onClick={() => {
                    gaNewChart();
                  }}
                />
              </NavigationMenu.Item>
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
                  label={t`Charts`}
                  to="/y"
                  icon={<FolderOpen height={20} width={20} />}
                  aria-current={isChartsPage ? "page" : undefined}
                  onClick={() => {
                    gaChangeTab({ action: "navigation" });
                  }}
                />
              </NavigationMenu.Item>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <HeaderButton
                    label={t`Help`}
                    aria-current={isHelpPage ? "page" : undefined}
                    icon={<Question height={20} width={20} />}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Documentation`}
                      icon={<Book height={20} width={20} />}
                      aria-current={isDocsPage ? "page" : undefined}
                      to="/h"
                      onClick={() => {
                        gaChangeTab({ action: "help" });
                      }}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderClientLink
                      label={t`Feedback`}
                      icon={<Chat height={20} width={20} />}
                      aria-current={isFeedbackPage ? "page" : undefined}
                      to="/o"
                      onClick={() => {
                        gaChangeTab({ action: "feedback" });
                      }}
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
                    icon={<Info height={20} width={20} />}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderLink
                      href="/blog/"
                      label={t`Blog`}
                      icon={<PencilLine height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderLink
                      href="/blog/changelog"
                      label={t`Changelog`}
                      icon={<Notebook height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderLink
                      href="/blog/roadmap"
                      label={t`Roadmap`}
                      icon={<Signpost height={20} width={20} />}
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <HeaderClientLink
                label={t`Settings`}
                icon={<Gear height={20} width={20} />}
                aria-current={isSettingsPage ? "page" : undefined}
                to="/s"
                onClick={() => {
                  gaChangeTab({ action: "settings" });
                }}
              />
              {isValidCustomer ? (
                <HeaderClientLink
                  label={t`Account`}
                  icon={<User height={20} width={20} />}
                  aria-current={isAccountPage ? "page" : undefined}
                  to="/a"
                  onClick={() => {
                    gaChangeTab({ action: "account" });
                  }}
                />
              ) : (
                <HeaderLink
                  href="/sponsor"
                  label={t`Become a Sponsor`}
                  icon={<Star height={20} width={20} />}
                  aria-current={isSponsorPage ? "page" : undefined}
                  onClick={() => {
                    // track in gtm
                    window.dataLayer.push({
                      event: "sponsor",
                      action: "click",
                      label: "header",
                    });
                  }}
                />
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
        isEditor={isEditor}
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
  isEditor,
}: {
  isDocsPage: boolean;
  isSponsorPage: boolean;
  isChartsPage: boolean;
  isSettingsPage: boolean;
  isAccountPage: boolean;
  isFeedbackPage: boolean;
  isEditor: boolean;
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
              icon={<Plus height={20} width={20} />}
              className="shared-header__new"
              to="/n"
              onClick={() => {
                gaNewChart();
              }}
            />
            <HeaderClientLink
              label={t`Editor`}
              icon={<TreeStructure height={20} width={20} />}
              aria-current={isEditor ? "page" : undefined}
              to={lastChart}
            />
            <HeaderClientLink
              label={t`Charts`}
              to="/y"
              icon={<FolderOpen height={20} width={20} />}
              aria-current={isChartsPage ? "page" : undefined}
              onClick={() => {
                gaChangeTab({ action: "navigation" });
              }}
            />
            <HeaderClientLink
              label={t`Documentation`}
              icon={<Book height={20} width={20} />}
              aria-current={isDocsPage ? "page" : undefined}
              className="mobile-only"
              to="/h"
              onClick={() => {
                gaChangeTab({ action: "help" });
              }}
            />
            <HeaderClientLink
              label={t`Feedback`}
              icon={<Chat height={20} width={20} />}
              aria-current={isFeedbackPage ? "page" : undefined}
              className="mobile-only"
              to="/o"
              onClick={() => {
                gaChangeTab({ action: "feedback" });
              }}
            />
            <HeaderLink
              href="/blog/"
              label={t`Blog`}
              icon={<PencilLine height={20} width={20} />}
            />
            <HeaderLink
              href="/blog/changelog"
              label={t`Changelog`}
              icon={<Notebook height={20} width={20} />}
            />
            <HeaderLink
              href="/blog/roadmap"
              label={t`Roadmap`}
              icon={<Signpost height={20} width={20} />}
            />
            <HeaderClientLink
              label={t`Settings`}
              icon={<Gear height={20} width={20} />}
              aria-current={isSettingsPage ? "page" : undefined}
              to="/s"
              onClick={() => {
                gaChangeTab({ action: "settings" });
              }}
            />
            {isValidCustomer ? (
              <HeaderClientLink
                label={t`Account`}
                icon={<User height={20} width={20} />}
                aria-current={isAccountPage ? "page" : undefined}
                to="/a"
                onClick={() => {
                  gaChangeTab({ action: "account" });
                }}
              />
            ) : (
              <HeaderLink
                href="/sponsor"
                label={t`Become a Sponsor`}
                icon={<Star height={20} width={20} />}
                aria-current={isSponsorPage ? "page" : undefined}
                onClick={() => {
                  // track event with gtm
                  window.dataLayer.push({
                    event: "sponsor",
                    action: "click",
                    label: "mobile-header",
                  });
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
