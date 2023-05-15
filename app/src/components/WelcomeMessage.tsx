import { t } from "@lingui/macro";
import { lazy, Suspense, useEffect, useState } from "react";
const Confetti = lazy(() => import("react-confetti"));

import { ReactComponent as Success } from "./Success.svg";

/**
 * The message that is displayed when user
 * is redirected to the login page
 * after first signing up
 */
export function WelcomeMessage() {
  const [windowSize, setWindowSize] = useState<[number, number] | null>(null);
  useEffect(() => {
    setWindowSize([window.innerWidth, window.innerHeight]);
  }, []);
  return (
    <>
      <div
        className="p-8 bg-purple-50 rounded-xl flex flex-col gap-3 items-center text-purple-700 shadow shadow-neutral-800/10 border-2 border-dashed border-purple-400"
        data-testid="welcome-message"
      >
        <Success className="w-36 h-36" />
        <h1 className="text text-lg font-bold">{t`Welcome to Flowchart Fun Pro!`}</h1>
        <p className="text-base leading-tight">
          Log in to start creating flowcharts.
        </p>
      </div>
      {windowSize && (
        <Suspense fallback={null}>
          <Confetti
            width={windowSize[0]}
            height={windowSize[1]}
            numberOfPieces={50}
            colors={["#e9efff", "#7f96ff", "#ffe590", "#e3ffdc", "#8252eb"]}
          />
        </Suspense>
      )}
    </>
  );
}
