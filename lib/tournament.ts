export type FootballDataStage =
  | "LAST_32"
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL";

export const TOURNAMENT_STAGE: FootballDataStage =
  (process.env.TOURNAMENT_STAGE as FootballDataStage | undefined) ??
  "QUARTER_FINALS";

export const STAGE_LABELS: Record<FootballDataStage, string> = {
  LAST_32: "Round of 32",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-final",
  SEMI_FINALS: "Semi-final",
  THIRD_PLACE: "Third-place play-off",
  FINAL: "Final",
};

export function stageLabel(stage: FootballDataStage = TOURNAMENT_STAGE): string {
  return STAGE_LABELS[stage] ?? stage;
}

export function footballDataMatchesUrl(
  stage: FootballDataStage = TOURNAMENT_STAGE
): string {
  return `https://api.football-data.org/v4/competitions/2000/matches?stage=${stage}`;
}
