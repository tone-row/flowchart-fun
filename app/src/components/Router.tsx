import { lazy, ReactNode } from "react";
import { Route, RouteProps, Switch } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import Feedback from "./Feedback";
import Layout from "./Layout";
import Settings from "./Settings";
/** Public view of hosted chart (permalink), readonly */
const Public = lazy(() => import("../pages/Public"));
/** Edit charts in local storage */
const Edit = lazy(() => import("../pages/Edit"));
/** Edit hosted chart */
const EditHosted = lazy(() => import("../pages/EditHosted"));
/** Read only chart, encoded in url / maybe fullscreen */
const ReadOnly = lazy(() => import("../pages/ReadOnly"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Blog = lazy(() => import("../pages/Blog"));
const Post = lazy(() => import("../pages/post/Post"));
const Changelog = lazy(() => import("../pages/Changelog"));
const Roadmap = lazy(() => import("../pages/Roadmap"));
const Account = lazy(() => import("../pages/Account"));
const New = lazy(() => import("../pages/New"));
const Login = lazy(() => import("../pages/LogIn"));
const Charts = lazy(() => import("../pages/Charts"));
const DesignSystem = lazy(() => import("../pages/DesignSystem"));

export default function Router() {
  usePageViews();
  return (
    <Switch>
      <RouteWithWrapper path="/" exact>
        <Edit />
      </RouteWithWrapper>
      <RouteWithWrapper path="/pricing" exact>
        <Pricing />
      </RouteWithWrapper>
      {/* "y" for "your charts" */}
      <RouteWithWrapper path="/y" exact>
        <Charts />
      </RouteWithWrapper>
      <RouteWithWrapper path="/n/:graphText?">
        <New />
      </RouteWithWrapper>
      <RouteWithWrapper path="/u/:id">
        <EditHosted />
      </RouteWithWrapper>
      <RouteWithWrapper path="/r/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      {/* c for "compressed" */}
      <RouteWithWrapper path="/c/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      <RouteWithWrapper path="/f/:graphText?">
        <ReadOnly />
      </RouteWithWrapper>
      <Route path="/p/:public_id">
        <Public />
      </Route>
      <RouteWithWrapper path="/s">
        <Settings />
      </RouteWithWrapper>
      {/* "o" for no reason at all */}
      <RouteWithWrapper path="/o">
        <Feedback />
      </RouteWithWrapper>
      <RouteWithWrapper path="/a">
        <Account />
      </RouteWithWrapper>
      {/* "l" for login */}
      <RouteWithWrapper path="/l">
        <Login />
      </RouteWithWrapper>
      <RouteWithWrapper path="/changelog">
        <Changelog />
      </RouteWithWrapper>
      <RouteWithWrapper path="/roadmap">
        <Roadmap />
      </RouteWithWrapper>
      <RouteWithWrapper path="/blog/post/:slug">
        <Post />
      </RouteWithWrapper>
      <RouteWithWrapper path="/blog">
        <Blog />
      </RouteWithWrapper>
      <RouteWithWrapper path="/d">
        <DesignSystem />
      </RouteWithWrapper>
      <RouteWithWrapper path="/:workspace">
        <Edit />
      </RouteWithWrapper>
    </Switch>
  );
}

/** Adds the share dialog. Could probably be in a better spot */
function RouteWrapper({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

function RouteWithWrapper({
  children,
  ...rest
}: {
  children: ReactNode;
} & RouteProps) {
  return (
    <Route {...rest}>
      <RouteWrapper>{children}</RouteWrapper>
    </Route>
  );
}
