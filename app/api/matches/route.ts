import { NextResponse } from "next/server";

const FOOTBALL_DATA_URL =
  "https://api.football-data.org/v4/competitions/2000/matches?stage=LAST_32";

// Cache this route's output at the edge for 5 minutes so bursts of traffic are
// served from Vercel's CDN instead of re-invoking the function.
export const revalidate = 300;

type MatchStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  score: { fullTime: { home: number | null; away: number | null } };
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
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch matches from football-data.org" },
      { status: res.status }
    );
  }

  const data: FootballDataResponse = await res.json();

  const matches: CleanedMatch[] = (data.matches ?? []).map((match) => ({
    id: match.id,
    utcDate: match.utcDate,
    status: match.status,
    homeTeam: match.homeTeam?.name ?? null,
    awayTeam: match.awayTeam?.name ?? null,
    score: {
      home: match.score?.fullTime?.home ?? null,
      away: match.score?.fullTime?.away ?? null,
    },
  }));

  return NextResponse.json(
    { matches },
    {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
