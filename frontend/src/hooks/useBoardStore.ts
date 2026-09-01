import { create } from 'zustand';
import type { BoardElement } from '../types/board';
import type { ToolType, StrokeStyle, CursorPos, PresenceUser } from '../types/canvas';

interface BoardStoreState {
  boardId: string | null;
  boardName: string;
  userRole: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';
  elements: BoardElement[];
  selectedElementId: string | null;
  
  // Active tool options
  activeTool: ToolType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  
  // Real-time state
  cursors: Map<string, CursorPos>;
  presence: PresenceUser[];

  // Local Undo / Redo stacks
  undoStack: BoardElement[][];
  redoStack: BoardElement[][];

  // Actions
  setBoardData: (id: string, name: string, role: 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER', elements: BoardElement[]) => void;
  setActiveTool: (tool: ToolType) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setSelectedElementId: (id: string | null) => void;
  
  // Element Operations
  addElement: (element: BoardElement) => void;
  updateElement: (elementId: string, updatedProps: Record<string, any>, newVersion?: number) => void;
  deleteElement: (elementId: string) => void;
  setElements: (elements: BoardElement[]) => void;

  // Real-time updates
  updateCursor: (cursor: CursorPos) => void;
  removeCursor: (userId: string) => void;
  setPresence: (users: PresenceUser[]) => void;

  // Undo / Redo
  undo: () => BoardElement[] | null;
  redo: () => BoardElement[] | null;
}

export const useBoardStore = create<BoardStoreState>((set, get) => ({
  boardId: null,
  boardName: 'Untitled Board',
  userRole: 'EDITOR',
  elements: [],
  selectedElementId: null,

  activeTool: 'select',
  strokeColor: '#f8fafc',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',

  cursors: new Map(),
  presence: [],

  undoStack: [],
  redoStack: [],

  setBoardData: (id, name, role, elements) => {
    set({ boardId: id, boardName: name, userRole: role, elements, undoStack: [], redoStack: [] });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  setElements: (elements) => set({ elements }),

  addElement: (element) => {
    const { elements, undoStack } = get();
    set({
      undoStack: [...undoStack, elements],
      redoStack: [],
      elements: [...elements, element],
    });
  },

  updateElement: (elementId, updatedProps, newVersion) => {
    const { elements, undoStack } = get();
    const updated = elements.map((el) => {
      if (el.elementId === elementId) {
        return {
          ...el,
          props: { ...el.props, ...updatedProps },
          version: newVersion || el.version + 1,
        };
      }
      return el;
    });
    set({
      undoStack: [...undoStack, elements],
      redoStack: [],
      elements: updated,
    });
  },

  deleteElement: (elementId) => {
    const { elements, undoStack } = get();
    set({
      undoStack: [...undoStack, elements],
      redoStack: [],
      elements: elements.filter((el) => el.elementId !== elementId),
      selectedElementId: null,
    });
  },

  updateCursor: (cursor) => {
    const nextMap = new Map(get().cursors);
    nextMap.set(cursor.userId, cursor);
    set({ cursors: nextMap });
  },

  removeCursor: (userId) => {
    const nextMap = new Map(get().cursors);
    nextMap.delete(userId);
    set({ cursors: nextMap });
  },

  setPresence: (presence) => set({ presence }),

  undo: () => {
    const { elements, undoStack, redoStack } = get();
    if (undoStack.length === 0) return null;
    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, undoStack.length - 1);
    set({
      elements: previous,
      undoStack: newUndoStack,
      redoStack: [...redoStack, elements],
    });
    return previous;
  },

  redo: () => {
    const { elements, undoStack, redoStack } = get();
    if (redoStack.length === 0) return null;
    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, redoStack.length - 1);
    set({
      elements: next,
      undoStack: [...undoStack, elements],
      redoStack: newRedoStack,
    });
    return next;
  },
}));
