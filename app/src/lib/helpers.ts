import { format, formatRelative as relative, parse } from "date-fns";
import { useEffect, useRef } from "react";
export function formatDate(date: string) {
  return format(parse(date, "t", new Date()), "MMMM do, yyyy");
}

export function formatRelative(date: string) {
  return relative(parse(date, "t", new Date()), new Date());
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function isError(x: unknown): x is Error {
  return Boolean(typeof x === "object" && x && "message" in x);
}

export function titleToLocalStorageKey(chartTitle: string) {
  return ["flowcharts.fun", chartTitle].filter(Boolean).join(":");
}

export const slugify = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "-").toLocaleLowerCase();

/** Returns a chart name not being used in local storage */
const getName = () => (Math.random() + 1).toString(36).substring(7);
export function randomChartName() {
  let name = getName();
  while (localStorage.getItem(titleToLocalStorageKey(name))) {
    name = getName();
  }
  return name;
}

const usePrevious = (value: any, initialValue: any) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useEffectDebugger = (
  effectHook: any,
  dependencies: any[],
  dependencyNames: string[] = []
) => {
  const previousDeps = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log("[use-effect-debugger] ", changedDeps);
  }

  useEffect(effectHook, [effectHook]);
};

export function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  // eslint-disable-next-line no-prototype-builtins
  return obj.hasOwnProperty(prop);
}
