import {
  createContext,
  ReactNode,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type DnDContextType = [
  string | null,
  Dispatch<SetStateAction<string | null>>,
  string | null,
  Dispatch<SetStateAction<string | null>>
];

const DnDContext = createContext<DnDContextType | null>(null);

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  return (
    <DnDContext.Provider value={[type, setType, version, setVersion]}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = (): DnDContextType => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error("useDnD must be used within a DnDProvider");
  }
  return context;
};

export default DnDContext;
