"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "worldcup-hottakes";

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

export function useLocalStorage(): UseLocalStorageReturn {
  const [name, setNameState] = useState("");
  const [predictions, setPredictionsState] = useState<Predictions>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readState();
    setNameState(stored.name);
    setPredictionsState(stored.predictions);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const state: StoredState = { name, predictions };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [name, predictions, hydrated]);

  const setName = (next: string) => {
    setNameState(next);
  };

  const setPrediction = (
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
  };

  return { name, setName, predictions, setPrediction };
}
