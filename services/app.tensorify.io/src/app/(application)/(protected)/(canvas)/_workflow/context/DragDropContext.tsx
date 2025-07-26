"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

// Drag and drop context type
type DragDropContextType = {
  draggedNodeType: string | null;
  setDraggedNodeType: Dispatch<SetStateAction<string | null>>;
  draggedVersion: string | null;
  setDraggedVersion: Dispatch<SetStateAction<string | null>>;
  isDragging: boolean;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
};

// Create the context
const DragDropContext = createContext<DragDropContextType | null>(null);

// Provider component
export const DragDropProvider = ({ children }: { children: ReactNode }) => {
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [draggedVersion, setDraggedVersion] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragDropContext.Provider
      value={{
        draggedNodeType,
        setDraggedNodeType,
        draggedVersion,
        setDraggedVersion,
        isDragging,
        setIsDragging,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

// Hook to use the drag and drop context
export const useDragDrop = (): DragDropContextType => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error("useDragDrop must be used within a DragDropProvider");
  }
  return context;
};

export default DragDropContext;
