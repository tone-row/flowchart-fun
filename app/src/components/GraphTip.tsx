import { useState, useEffect } from "react";
import { X } from "phosphor-react";
import { Trans } from "@lingui/macro";

export function GraphTip() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFading(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`
        absolute top-4 left-4 
        text-xs text-gray-500/60 dark:text-gray-400/60
        transition-opacity duration-1000
        ${isFading ? "opacity-0" : "opacity-100"}
      `}
      onTransitionEnd={() => {
        if (isFading) setIsVisible(false);
      }}
    >
      <Trans>
        Pro tip: Right-click any node to customize its shape and color
      </Trans>
      <button
        onClick={() => setIsFading(true)}
        className="inline-block ml-1 text-gray-400/60 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label="Close tip"
      >
        <X size={12} />
      </button>
    </div>
  );
}
