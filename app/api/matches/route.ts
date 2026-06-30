import { NextResponse } from "next/server";

const FOOTBALL_DATA_URL =
  "https://api.football-data.org/v4/competitions/2000/matches?stage=LAST_32";

export const revalidate = 60;

type MatchStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";
type ScoreDuration = "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";

interface ScoreLine {
  home: number | null;
  away: number | null;
}

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  score: {
    duration?: ScoreDuration;
    fullTime: ScoreLine;
    halfTime?: ScoreLine;
    regularTime?: ScoreLine;
    penalties?: ScoreLine;
  };
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

export interface CleanedMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: string | null;
  awayTeam: string | null;
  score: { home: number | null; away: number | null };
  penalties: { home: number | null; away: number | null } | null;
  scoreDuration: ScoreDuration | null;
}

function lineOrNull(line?: ScoreLine | null): ScoreLine | null {
  if (line?.home == null || line?.away == null) return null;
  return { home: line.home, away: line.away };
}

// Predictions are for 90-minute scorelines. Use regularTime when the API
// provides it (knockout games decided on pens). fullTime often holds pen totals.
function extractMatchScores(match: FootballDataMatch): {
  score: ScoreLine;
  penalties: ScoreLine | null;
  scoreDuration: ScoreDuration | null;
} {
  const score = match.score;
  if (!score) {
    return {
      score: { home: null, away: null },
      penalties: null,
      scoreDuration: null,
    };
  }

  const scoreDuration = score.duration ?? null;
  const penalties = lineOrNull(score.penalties);

  if (match.status === "FINISHED") {
    const regular = lineOrNull(score.regularTime);
    if (regular) {
      return { score: regular, penalties, scoreDuration };
    }
    const full = lineOrNull(score.fullTime);
    if (full) {
      return { score: full, penalties, scoreDuration };
    }
  }

  // Live / in-progress: running score from fullTime, then halfTime.
  for (const line of [score.fullTime, score.halfTime]) {
    const parsed = lineOrNull(line);
    if (parsed) {
      return { score: parsed, penalties, scoreDuration };
    }
  }

  return {
    score: {
      home: score.fullTime?.home ?? null,
      away: score.fullTime?.away ?? null,
    },
    penalties,
    scoreDuration,
  };
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "FOOTBALL_DATA_API_KEY is not set" },
      { status: 500 }
    );
  }

  const res = await fetch(FOOTBALL_DATA_URL, {
    headers: { "X-Auth-Token": apiKey },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch matches from football-data.org" },
      { status: res.status }
    );
  }

  const data: FootballDataResponse = await res.json();

  const matches: CleanedMatch[] = (data.matches ?? []).map((match) => {
    const { score, penalties, scoreDuration } = extractMatchScores(match);
    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      homeTeam: match.homeTeam?.name ?? null,
      awayTeam: match.awayTeam?.name ?? null,
      score,
      penalties,
      scoreDuration,
    };
  });

  return NextResponse.json(
    { matches },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "CDN-Cache-Control": "max-age=60, stale-while-revalidate=30",
      },
    }
  );
}
