import { PostHogProvider } from "posthog-js/react";
import type { PostHogConfig } from "posthog-js";

const options: Partial<PostHogConfig> = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  persistence: "localStorage",
};

export function PosthogWrapper({ children }: { children: React.ReactNode }) {
  if (process.env.REACT_APP_VERCEL_ENV !== "production") {
    return <>{children}</>;
  }

  return (
    <PostHogProvider
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      {children}
    </PostHogProvider>
  );
}
