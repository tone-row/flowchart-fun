import { create } from "zustand";

interface UndoAction {
  kind: "ai" | "layout";
  undo: () => void;
  redo: () => void;
}

const useUndoHistory = create<{ done: UndoAction[]; undone: UndoAction[] }>(
  () => ({ done: [], undone: [] })
);

export function clearUndoHistory() {
  useUndoHistory.setState({ done: [], undone: [] });
}

export function addToUndoStack(action: UndoAction) {
  useUndoHistory.setState(({ done }) => ({
    done: [...done, action],
    undone: [],
  }));
}

export function undo() {
  const { done, undone } = useUndoHistory.getState();
  const action = done.at(-1);
  if (!action) return;
  action.undo();
  useUndoHistory.setState({
    done: done.slice(0, -1),
    undone: [...undone, action],
  });
}

export function redo() {
  const { done, undone } = useUndoHistory.getState();
  const action = undone.at(-1);
  if (!action) return;
  action.redo();
  useUndoHistory.setState({
    done: [...done, action],
    undone: undone.slice(0, -1),
  });
}

export function canUndo(): boolean {
  return useUndoHistory.getState().done.length > 0;
}

export function canRedo(): boolean {
  return useUndoHistory.getState().undone.length > 0;
}

export function useIsAiEditNewest() {
  return useUndoHistory(({ done }) => done.at(-1)?.kind === "ai");
}
