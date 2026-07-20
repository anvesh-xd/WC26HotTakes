// Static post-tournament showcase data. Numbers are illustrative — the cup
// is over and we no longer poll live fixtures or markets on the frontend.

export const FINAL = {
  home: "Spain",
  away: "Argentina",
  homeScore: 1,
  awayScore: 0,
  venue: "MetLife Stadium · East Rutherford",
  dateLabel: "Sunday, July 19, 2026",
} as const;

export const CHAMPION = "Spain" as const;

export const SHARECARDS_SHARED = 185;

export interface RecapStat {
  value: number;
  label: string;
  suffix?: string;
}

export const RECAP_STATS: RecapStat[] = [
  { value: SHARECARDS_SHARED, label: "Sharecards Shared" },
  { value: 104, label: "Matches Played" },
  { value: 271, label: "Goals Scored" },
  { value: 48, label: "Teams in the Field" },
];

export interface TournamentMoment {
  round: string;
  headline: string;
  detail: string;
}

export const TOURNAMENT_MOMENTS: TournamentMoment[] = [
  {
    round: "Group Stage",
    headline: "48 nations, zero quiet nights",
    detail:
      "The expanded field delivered upsets from day one — favorites scraped through, underdogs punched tickets.",
  },
  {
    round: "Knockouts",
    headline: "Extra time became the default",
    detail:
      "Twelve knockout ties needed extra time or penalties. Spain survived three of them.",
  },
  {
    round: "Semi-finals",
    headline: "Spain 2 – 1 France",
    detail:
      "A late winner in Dallas sent La Roja to the final for the first time since 2010.",
  },
  {
    round: "The Final",
    headline: "Spain 1 – 0 Argentina",
    detail:
      "One moment of brilliance decided it. The trophy heads back to Madrid.",
  },
];
