import { Details, useDetailsStore } from "./useDoc";

/**
 * Get a type-safe version of any property
 * of the doc details
 */

export function useDetails<K extends keyof Details>(
  prop: K,
  fallback?: Details[K]
) {
  return useDetailsStore((state) => state[prop] || fallback) as Details[K];
}
