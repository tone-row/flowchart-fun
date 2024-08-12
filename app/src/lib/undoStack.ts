interface UndoAction {
  undo: () => void;
  redo: () => void;
}

let undoStack: UndoAction[] = [];
let redoStack: UndoAction[] = [];

export function addToUndoStack(action: UndoAction) {
  undoStack.push(action);
  redoStack = []; // Clear redo stack when a new action is performed
}

export function undo() {
  const action = undoStack.pop();
  if (action) {
    action.undo();
    redoStack.push(action);
  }
}

export function redo() {
  const action = redoStack.pop();
  if (action) {
    action.redo();
    undoStack.push(action);
  }
}

// Optional: Add a function to check if undo/redo is available
export function canUndo(): boolean {
  return undoStack.length > 0;
}

export function canRedo(): boolean {
  return redoStack.length > 0;
}
