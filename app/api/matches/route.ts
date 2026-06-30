import { NextResponse } from "next/server";

const FOOTBALL_DATA_URL =
  "https://api.football-data.org/v4/competitions/2000/matches?stage=LAST_32";

// Revalidate upstream data every 60s — short enough for live scores, still
// protects the football-data.org rate limit under traffic spikes.
export const revalidate = 60;

type MatchStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";

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
    fullTime: ScoreLine;
    halfTime?: ScoreLine;
    regularTime?: ScoreLine;
  };
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
}

interface CleanedMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: string | null;
  awayTeam: string | null;
  score: { home: number | null; away: number | null };
}

function extractScore(match: FootballDataMatch): ScoreLine {
  const score = match.score;
  if (!score) return { home: null, away: null };

  const lines = [score.fullTime, score.regularTime, score.halfTime];
  for (const line of lines) {
    if (line?.home != null && line?.away != null) {
      return { home: line.home, away: line.away };
    }
  }

  return {
    home: score.fullTime?.home ?? null,
    away: score.fullTime?.away ?? null,
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
    const score = extractScore(match);
    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      homeTeam: match.homeTeam?.name ?? null,
      awayTeam: match.awayTeam?.name ?? null,
      score,
    };
  });

  return NextResponse.json(
    { matches },
    {
      headers: {
        // Browsers must not reuse a stale JSON snapshot (fixes stuck predictions UI).
        "Cache-Control": "no-cache, no-store, must-revalidate",
        // Vercel edge may cache briefly to absorb traffic without hammering upstream.
        "CDN-Cache-Control": "max-age=60, stale-while-revalidate=30",
      },
    }
  );
}
