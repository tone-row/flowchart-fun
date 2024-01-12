import { lazy } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import { usePageViews } from "../lib/analytics";
import Feedback from "./Feedback";
import Layout from "./Layout";
import Settings from "./Settings";
import { AuthWall } from "./AuthWall";
import Login from "../pages/LogIn";
import ResetPassword from "../pages/ResetPassword";
/** Public view of hosted chart (permalink), readonly */
const Public = lazy(() => import("../pages/Public"));
/** Edit charts in local storage */
const Sandbox = lazy(() => import("../pages/Sandbox"));
/** Edit hosted chart */
const EditHosted = lazy(() => import("../pages/EditHosted"));
/** Read only chart, encoded in url / maybe fullscreen */
const ReadOnly = lazy(() => import("../pages/ReadOnly"));
// const Pricing = lazy(() => import("../pages/Pricing"));
const Pricing2 = lazy(() => import("../pages/Pricing2"));
const Blog = lazy(() => import("../pages/Blog"));
const Post = lazy(() => import("../pages/post/Post"));
const Changelog = lazy(() => import("../pages/Changelog"));
const Roadmap = lazy(() => import("../pages/Roadmap"));
const Account = lazy(() => import("../pages/Account"));
const New = lazy(() => import("../pages/New"));
const Charts = lazy(() => import("../pages/Charts"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const DesignSystem = lazy(() => import("../pages/DesignSystem"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("../pages/CookiePolicy"));
const Success = lazy(() => import("../pages/Success"));
import Page404 from "../pages/404";
import { useSupportLegacyNRoute } from "../lib/useSupportLegacyNRoute";
const Fullscreen = lazy(() => import("../pages/Fullscreen"));

export default function Router() {
  usePageViews();
  useSupportLegacyNRoute();
  return (
    <Routes>
      <Route path="/" element={<Wrapper />}>
        <Route index element={<Sandbox />} />
        <Route path="/pricing" element={<Pricing2 />} />
        {/* "y" for "your charts" */}
        <Route
          path="/y"
          element={
            <AuthWall>
              <Charts />
            </AuthWall>
          }
        />
        <Route
          path="/new"
          element={
            <AuthWall>
              <New />
            </AuthWall>
          }
        />
        <Route path="/u/:id" element={<EditHosted />} />
        <Route path="/r/:graphText?" element={<ReadOnly />} />
        {/* c for "compressed" */}
        <Route path="/c/:graphText?" element={<ReadOnly />} />
        <Route path="/f/:graphText?" element={<Fullscreen />} />
        <Route path="/p/:public_id" element={<Public />} />
        <Route path="/s" element={<Settings />} />
        {/* "o" for no reason at all */}
        <Route path="/o" element={<Feedback />} />
        <Route path="/a" element={<Account />} />
        <Route path="/l" element={<Login />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/blog/post/:slug" element={<Post />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/d" element={<DesignSystem />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
}

function Wrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
