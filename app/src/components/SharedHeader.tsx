import { t } from "@lingui/macro";
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
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";

import { gaChangeTab, gaNewChart } from "../lib/analytics";
import { AppContext } from "./AppContext";
import { ReactComponent as BrandSvg } from "./brand.svg";

export const SharedHeader = memo(function SharedHeader() {
  const { showing, setShowing } = useContext(AppContext);
  const { push } = useHistory();
  const { url } = useRouteMatch();
  const isDocsPage = url === "/h" && showing === "editor";
  const [collapsed, setCollapsed] = useState(true);
  const { pathname } = useLocation();
  useEffect(() => {
    setCollapsed(true);
  }, [pathname, showing]);
  return (
    <NavigationMenu.Root asChild>
      <header className={`shared-header ${collapsed ? "collapsed" : ""}`}>
        <NavigationMenu.List asChild>
          <nav className="shared-header__left">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="shared-header__logo"
            >
              <BrandSvg width={40} />
            </button>
            <NavigationMenu.Item asChild>
              <HeaderButton
                label={t`New`}
                icon={<Plus height={20} width={20} />}
                className="shared-header__new"
                onClick={() => {
                  push("/n");
                  setShowing("editor");
                  gaNewChart();
                }}
              />
            </NavigationMenu.Item>
            <NavigationMenu.Item asChild>
              <HeaderButton
                label={t`Editor`}
                icon={<TreeStructure height={20} width={20} />}
                aria-current={
                  showing === "editor" && !isDocsPage ? "page" : undefined
                }
                onClick={() => {
                  setShowing("editor");
                  isDocsPage && push("/");
                  gaChangeTab({ action: "editor" });
                }}
              />
            </NavigationMenu.Item>
            <NavigationMenu.Item asChild>
              <HeaderButton
                label={t`Charts`}
                icon={<FolderOpen height={20} width={20} />}
                aria-current={showing === "navigation" ? "page" : undefined}
                onClick={() => {
                  setShowing("navigation");
                  gaChangeTab({ action: "navigation" });
                }}
              />
            </NavigationMenu.Item>
            <DesktopOnly>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <HeaderButton
                    label={t`Help`}
                    aria-current={
                      showing === "feedback" || isDocsPage ? "page" : undefined
                    }
                    icon={<Question height={20} width={20} />}
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="start"
                  className="shared-header__dropdown"
                >
                  <DropdownMenu.Item asChild>
                    <HeaderButton
                      label={t`Documentation`}
                      icon={<Book height={20} width={20} />}
                      aria-current={isDocsPage ? "page" : undefined}
                      onClick={() => {
                        push("/h");
                        setShowing("editor");
                        gaChangeTab({ action: "help" });
                      }}
                    />
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <HeaderButton
                      label={t`Feedback`}
                      icon={<Chat height={20} width={20} />}
                      aria-current={showing === "feedback" ? "page" : undefined}
                      onClick={() => {
                        setShowing("feedback");
                        gaChangeTab({ action: "feedback" });
                      }}
                    />
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </DesktopOnly>
            <HeaderButton
              label={t`Documentation`}
              icon={<Book height={20} width={20} />}
              aria-current={isDocsPage ? "page" : undefined}
              className="mobile-only"
              onClick={() => {
                push("/h");
                setShowing("editor");
                gaChangeTab({ action: "help" });
              }}
            />
            <HeaderButton
              label={t`Feedback`}
              icon={<Chat height={20} width={20} />}
              aria-current={showing === "feedback" ? "page" : undefined}
              className="mobile-only"
              onClick={() => {
                setShowing("feedback");
                gaChangeTab({ action: "feedback" });
              }}
            />
          </nav>
        </NavigationMenu.List>
        <NavigationMenu.List asChild>
          <nav className="shared-header__right">
            <DesktopOnly>
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
            </DesktopOnly>
            <HeaderLink
              href="/blog/"
              label={t`Blog`}
              className="mobile-only"
              icon={<PencilLine height={20} width={20} />}
            />
            <HeaderLink
              href="/blog/changelog"
              label={t`Changelog`}
              className="mobile-only"
              icon={<Notebook height={20} width={20} />}
            />
            <HeaderLink
              href="/blog/roadmap"
              label={t`Roadmap`}
              className="mobile-only"
              icon={<Signpost height={20} width={20} />}
            />
            <HeaderButton
              label={t`Settings`}
              icon={<Gear height={20} width={20} />}
              aria-current={showing === "settings" ? "page" : undefined}
              onClick={() => {
                setShowing("settings");
                gaChangeTab({ action: "settings" });
              }}
            />
            <HeaderButton
              label={t`Account`}
              icon={<User height={20} width={20} />}
              aria-current={showing === "sponsor" ? "page" : undefined}
              onClick={() => {
                setShowing("sponsor");
                gaChangeTab({ action: "sponsor" });
              }}
            />
          </nav>
        </NavigationMenu.List>
      </header>
    </NavigationMenu.Root>
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

function DesktopOnly({ children }: { children: ReactNode }) {
  return <div className="desktop-only">{children}</div>;
}
