import { track } from "@vercel/analytics";

const FIRST_PREDICTION_KEY = "wc26-tracked-first-prediction";

export function trackCardStamped(
  predictions: number,
  method: "share" | "download"
) {
  track("card_stamped", { predictions, method });
}

/** Fires once per browser (localStorage) when the user saves their first pick. */
export function trackFirstPredictionOnce() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(FIRST_PREDICTION_KEY)) return;
  localStorage.setItem(FIRST_PREDICTION_KEY, "1");
  track("first_prediction");
}

/** Fires each time a match gets a non-empty hot take for the first time. */
export function trackHotTakeAdded(matchId: string | number) {
  track("hot_take_added", { matchId: String(matchId) });
}
