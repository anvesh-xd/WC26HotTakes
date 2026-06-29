"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "worldcup-hottakes";
const PERSIST_DEBOUNCE_MS = 300;

export interface Prediction {
  home: number;
  away: number;
  hotTake?: string;
}

export type Predictions = Record<string, Prediction>;

interface StoredState {
  name: string;
  predictions: Predictions;
}

interface UseLocalStorageReturn {
  name: string;
  setName: (name: string) => void;
  predictions: Predictions;
  setPrediction: (
    matchId: string | number,
    home: number,
    away: number,
    hotTake?: string
  ) => void;
}

function readState(): StoredState {
  if (typeof window === "undefined") {
    return { name: "", predictions: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { name: "", predictions: {} };
    }
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      predictions:
        parsed.predictions && typeof parsed.predictions === "object"
          ? parsed.predictions
          : {},
    };
  } catch {
    return { name: "", predictions: {} };
  }
}

function writeState(state: StoredState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useLocalStorage(): UseLocalStorageReturn {
  const [name, setNameState] = useState("");
  const [predictions, setPredictionsState] = useState<Predictions>({});
  const [hydrated, setHydrated] = useState(false);

  const stateRef = useRef<StoredState>({ name: "", predictions: {} });
  stateRef.current = { name, predictions };

  useEffect(() => {
    const stored = readState();
    setNameState(stored.name);
    setPredictionsState(stored.predictions);
    stateRef.current = stored;
    setHydrated(true);
  }, []);

  // Debounce disk writes so rapid keystrokes don't block the main thread.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const timer = window.setTimeout(() => {
      writeState(stateRef.current);
    }, PERSIST_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [name, predictions, hydrated]);

  // Flush pending writes when the tab hides or the page unloads.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;

    const flush = () => writeState(stateRef.current);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hydrated]);

  const setName = useCallback((next: string) => {
    setNameState(next);
  }, []);

  const setPrediction = useCallback(
    (
      matchId: string | number,
      home: number,
      away: number,
      hotTake?: string
    ) => {
      const trimmed = hotTake?.trim();
      setPredictionsState((prev) => ({
        ...prev,
        [String(matchId)]: {
          home,
          away,
          ...(trimmed ? { hotTake } : {}),
        },
      }));
    },
    []
  );

  return { name, setName, predictions, setPrediction };
}
