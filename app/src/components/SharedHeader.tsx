import { t } from "@lingui/macro";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  Book,
  FolderOpen,
  Gear,
  Info,
  Plus,
  Question,
  TreeStructure,
  User,
} from "phosphor-react";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  useContext,
} from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

import { gaChangeTab, gaNewChart } from "../lib/analytics";
import { AppContext } from "./AppContext";
import { ReactComponent as BrandSvg } from "./brand.svg";

export function SharedHeader() {
  const { showing, setShowing } = useContext(AppContext);
  const { push } = useHistory();
  const { url } = useRouteMatch();
  const isHelpPage = url === "/h";
  return (
    <NavigationMenu.Root asChild>
      <header className="shared-header">
        <NavigationMenu.List asChild>
          <nav className="shared-header__left">
            <div className="shared-header__logo">
              <BrandSvg width={40} />
            </div>
            <NavigationMenu.Item asChild>
              <HeaderButton
                label={t`New`}
                icon={<Plus height={20} width={20} />}
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
                  showing === "editor" && !isHelpPage ? "page" : undefined
                }
                onClick={() => {
                  setShowing("editor");
                  isHelpPage && push("/");
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
            <NavigationMenu.Item>
              <NavigationMenu.Trigger asChild>
                <HeaderButton
                  label={t`Help`}
                  icon={<Question height={20} width={20} />}
                  // onClick={() => {
                  //   push("/h");
                  //   setShowing("editor");
                  //   gaChangeTab({ action: "help" });
                  // }}
                />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Sub>
                  <NavigationMenu.List>
                    <NavigationMenu.Item>
                      <HeaderButton
                        label={t`Documentation`}
                        icon={<Book height={20} width={20} />}
                        onClick={() => {
                          push("/h");
                          setShowing("editor");
                          gaChangeTab({ action: "help" });
                        }}
                      />
                    </NavigationMenu.Item>
                    <NavigationMenu.Item>hello world</NavigationMenu.Item>
                  </NavigationMenu.List>
                  <NavigationMenu.Viewport />
                </NavigationMenu.Sub>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </nav>
        </NavigationMenu.List>
        <NavigationMenu.List asChild>
          <nav className="shared-header__right">
            <HeaderButton
              label={t`Info`}
              icon={<Info height={20} width={20} />}
            />
            <HeaderButton
              label={t`Settings`}
              icon={<Gear height={20} width={20} />}
              onClick={() => {
                setShowing("settings");
                gaChangeTab({ action: "settings" });
              }}
            />
            <HeaderButton
              label={t`Account`}
              icon={<User height={20} width={20} />}
            />
          </nav>
        </NavigationMenu.List>
      </header>
    </NavigationMenu.Root>
  );
}

function HeaderButton({
  label: children,
  icon,
  ...props
}: {
  label: string;
  icon: ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) {
  return (
    <button className="shared-header-btn" aria-current {...props}>
      <span className="shared-header-btn__icon">{icon}</span>
      <span className="shared-header-btn__label">{children}</span>
    </button>
  );
}
