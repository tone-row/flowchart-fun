import { LOCAL_STORAGE_SETTINGS_KEY } from "./constants";

export function getTemporaryCharts() {
  return [""]
    .concat(
      Object.keys(window.localStorage)
        .filter(
          (key) =>
            key.indexOf("flowcharts.fun:") === 0 &&
            key !== LOCAL_STORAGE_SETTINGS_KEY
        )
        .map((file) => file.split(":")[1])
    )
    .sort();
}
