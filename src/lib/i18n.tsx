import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { getLocales } from "expo-localization";
import { storage } from "./storage";

export type Lang = "de" | "en";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (de: string, en: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = "droppi.lang";

function deviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode?.toLowerCase() ?? "de";
    return code.startsWith("en") ? "en" : "de";
  } catch {
    return "de";
  }
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = storage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === "de" || saved === "en") return saved;
    return deviceLang();
  });

  useEffect(() => {
    try {
      storage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((de: string, en: string) => (lang === "en" ? en : de), [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

/** Convenience hook returning just `t`. */
export const useT = () => useI18n().t;
