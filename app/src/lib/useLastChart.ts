import { useEffect } from "react";
import create from "zustand";

type LastChart = {
  lastChart: string;
};

/** Store the last chart (hosted or local, but not help) that the user was on */
export const useLastChart = create<LastChart>(() => ({
  lastChart: "/",
}));

/**
 * Pass in the url of the current chart on relevant pages
 * So we can send people back to it with the Editor link
 */
export function useTrackLastChart(url: string) {
  useEffect(() => {
    if (url) {
      useLastChart.setState({ lastChart: url });
    }
  }, [url]);
}
