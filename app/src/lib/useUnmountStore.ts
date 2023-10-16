import { create } from "zustand";

/**
 * This store is used to trigger unmounting of the graph
 * when the user clicks the reset button
 */
export const useUnmountStore = create<{
  unmount: boolean;
}>(() => ({
  unmount: false,
}));

/**
 * Unmounts the graph
 */
export function unmountGraph() {
  useUnmountStore.setState({
    unmount: true,
  });
}

/**
 * Mounts the graph again
 */
export function mountGraph() {
  useUnmountStore.setState({
    unmount: false,
  });
}

/**
 * Unmounts the graph and then mounts it again 100ms later
 */
export function resetGraph(): Promise<void> {
  return new Promise((resolve) => {
    unmountGraph();
    setTimeout(() => {
      mountGraph();
      resolve();
    }, 100);
  });
}
