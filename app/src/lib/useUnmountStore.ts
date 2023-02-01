import create from "zustand";

/**
 * This store is used to trigger unmounting of the graph
 * when the user clicks the reset button
 */
export const useUnmountStore = create<{
  unmount: boolean;
}>(() => ({
  unmount: false,
}));
