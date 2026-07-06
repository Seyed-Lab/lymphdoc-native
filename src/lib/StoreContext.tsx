import { createContext, useContext, ReactNode } from "react";
import { useDroppiStore } from "./store";

export type DroppiStore = ReturnType<typeof useDroppiStore>;

const StoreContext = createContext<DroppiStore | null>(null);

/** Single store instance shared across all routes (web app created it in Index.tsx). */
export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const store = useDroppiStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useStore = (): DroppiStore => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};
