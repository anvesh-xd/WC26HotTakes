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

export interface IndividualAward {
  award: string;
  winner: string;
}

export const INDIVIDUAL_AWARDS: IndividualAward[] = [
  { award: "Golden Ball", winner: "Rodri" },
  { award: "Golden Boot", winner: "Mbappé" },
  { award: "Golden Glove", winner: "Unai Simón" },
  { award: "Young Player Award", winner: "Pau Cubarsí" },
];

export const SHARECARDS_SHARED = 185;

export interface RecapStat {
  value: number;
  label: string;
  suffix?: string;
}

export const RECAP_STATS: RecapStat[] = [
  { value: SHARECARDS_SHARED, label: "Sharecards Shared" },
  { value: 309, label: "Total Goals Scored" },
];

export interface TournamentMoment {
  round: string;
  headline: string;
  detail: string;
}

export const TOURNAMENT_MOMENTS: TournamentMoment[] = [
  {
    round: "Group Stage",
    headline: "Underdogs rewrite the script",
    detail:
      "Spain’s only draw of the tournament came 0–0 with Cape Verde — every other match was a win. Curaçao held Ecuador 0–0, DR Congo drew Portugal 1–1, New Zealand shared points with Iran 2–2, and Australia beat Turkey 2–0.",
  },
  {
    round: "Knockouts",
    headline: "Extra time and spot kicks",
    detail:
      "Seven of thirty-two knockout matches went to extra time or penalties.",
  },
  {
    round: "Semi-finals",
    headline: "Two very different nights",
    detail:
      "Spain dominated France end to end, while Argentina clawed back from behind to beat England.",
  },
  {
    round: "The Final",
    headline: "Spain 1 – 0 Argentina",
    detail:
      "Argentina finished with zero shots on target. One goal was enough.",
  },
];
