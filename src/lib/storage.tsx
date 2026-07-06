import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

/**
 * Native replacement for the web app's localStorage/sessionStorage hooks.
 *
 * Web -> Native mapping:
 *   usePersistedState (localStorage)   -> usePersistedState (AsyncStorage, hydrated at boot)
 *   useSessionState  (sessionStorage)  -> useSessionState  (in-memory only; survives remounts,
 *                                         cleared on app restart - same semantics as a browser tab)
 *
 * All persisted keys are loaded ONCE at app start into a synchronous in-memory cache
 * (see StorageProvider). After hydration, reads are synchronous just like localStorage,
 * so the ported store logic behaves identically. Writes go to the cache immediately
 * and to AsyncStorage in the background (write-through).
 */

const memoryCache = new Map<string, string>();
const sessionCache = new Map<string, string>();

const PERSIST_PREFIX = "lymphdoc:";

async function hydrate(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(PERSIST_PREFIX));
  if (ours.length === 0) return;
  const pairs = await AsyncStorage.multiGet(ours);
  for (const [k, v] of pairs) {
    if (v != null) memoryCache.set(k.slice(PERSIST_PREFIX.length), v);
  }
}

function persistWrite(key: string, value: string) {
  memoryCache.set(key, value);
  AsyncStorage.setItem(PERSIST_PREFIX + key, value).catch(() => {});
}

const HydrationContext = createContext<boolean>(false);

/** Gate the app behind storage hydration. Render children only when ready. */
export const StorageProvider = ({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, []);
  if (!ready) return <>{fallback}</>;
  return <HydrationContext.Provider value={true}>{children}</HydrationContext.Provider>;
};

export const useStorageReady = () => useContext(HydrationContext);

/** Persisted across app restarts (AsyncStorage-backed). Synchronous after hydration. */
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const stored = memoryCache.get(key);
    if (stored != null) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  const set = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        persistWrite(keyRef.current, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return [state, set] as const;
}

/** Survives remounts within one app session; cleared on restart (sessionStorage semantics). */
export function useSessionState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    const stored = sessionCache.get(key);
    if (stored != null) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  const set = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
      try {
        sessionCache.set(keyRef.current, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return [state, set] as const;
}

/** Imperative helpers mirroring localStorage for non-hook call sites (e.g. i18n, intro-done flag). */
export const storage = {
  getItem(key: string): string | null {
    return memoryCache.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    persistWrite(key, value);
  },
  removeItem(key: string) {
    memoryCache.delete(key);
    AsyncStorage.removeItem(PERSIST_PREFIX + key).catch(() => {});
  },
};
