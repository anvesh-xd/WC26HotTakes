import type { Prediction } from "@/lib/useLocalStorage";

export type PredictionGrade = "exact" | "outcome" | "wrong";

function outcome(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

// Grades a prediction against a finished match's 90-minute score:
// - "exact":   identical scoreline
// - "outcome": correct winner or draw, but wrong scoreline
// - "wrong":   wrong winner / draw
export function gradePrediction(
  prediction: Prediction,
  actualHome: number,
  actualAway: number
): PredictionGrade {
  if (prediction.home === actualHome && prediction.away === actualAway) {
    return "exact";
  }
  if (
    outcome(prediction.home, prediction.away) ===
    outcome(actualHome, actualAway)
  ) {
    return "outcome";
  }
  return "wrong";
}

export type MatchWinner = "home" | "away" | "draw" | null;

export interface PenaltyScore {
  home: number | null;
  away: number | null;
}

export function matchWinner(
  home: number | null,
  away: number | null,
  penalties?: PenaltyScore | null
): MatchWinner {
  if (home == null || away == null) return null;
  if (home > away) return "home";
  if (away > home) return "away";

  const penHome = penalties?.home;
  const penAway = penalties?.away;
  if (penHome != null && penAway != null) {
    if (penHome > penAway) return "home";
    if (penAway > penHome) return "away";
  }

  return "draw";
}
