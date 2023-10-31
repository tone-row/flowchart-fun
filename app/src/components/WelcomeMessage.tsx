import { t } from "@lingui/macro";

import { ReactComponent as Success } from "./Success.svg";

/**
 * The message that is displayed when user
 * is redirected to the login page
 * after first signing up
 */
export function WelcomeMessage() {
  return (
    <>
      <div
        className="p-8 bg-purple-50 rounded-xl flex flex-col gap-3 items-center text-purple-700 shadow shadow-neutral-800/10 border-2 border-dashed border-purple-400 mx-4 dark:bg-transparent dark:border-purple-600 mb-5"
        data-testid="welcome-message"
      >
        <Success className="w-36 h-36" />
        <h1 className="text text-center text-lg font-bold">{t`Welcome to Flowchart Fun Pro!`}</h1>
        <p className="text-base leading-tight">
          {t`Log in to start creating flowcharts.`}
        </p>
      </div>
    </>
  );
}
