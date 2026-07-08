import { NextResponse } from "next/server";
import {
  fetchKalshiData,
  matchKalshiGameOdds,
  type TournamentWinnerOdds,
} from "@/lib/kalshi";
import {
  footballDataMatchesUrl,
  stageLabel,
  TOURNAMENT_STAGE,
} from "@/lib/tournament";

export const dynamic = "force-dynamic";

type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED";
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

export interface MatchKalshiOdds {
  homeWinPct: number | null;
  awayWinPct: number | null;
  drawPct: number | null;
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
  stageLabel: string;
  kalshi: MatchKalshiOdds | null;
}

function lineOrNull(line?: ScoreLine | null): ScoreLine | null {
  if (line?.home == null || line?.away == null) return null;
  return { home: line.home, away: line.away };
}

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

  const label = stageLabel();

  const [footballRes, kalshiResult] = await Promise.all([
    fetch(footballDataMatchesUrl(), {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    }),
    fetchKalshiData().catch(() => ({
      gameOddsByEvent: new Map<string, Record<string, number>>(),
      tournamentWinners: [] as TournamentWinnerOdds[],
    })),
  ]);

  if (!footballRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch matches from football-data.org" },
      { status: footballRes.status }
    );
  }

  const data: FootballDataResponse = await footballRes.json();
  const { gameOddsByEvent, tournamentWinners } = kalshiResult;

  const matches: CleanedMatch[] = (data.matches ?? []).map((match) => {
    const { score, penalties, scoreDuration } = extractMatchScores(match);
    const homeTeam = match.homeTeam?.name ?? null;
    const awayTeam = match.awayTeam?.name ?? null;

    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      homeTeam,
      awayTeam,
      score,
      penalties,
      scoreDuration,
      stageLabel: label,
      kalshi: matchKalshiGameOdds(homeTeam, awayTeam, gameOddsByEvent),
    };
  });

  return NextResponse.json(
    { matches, tournamentWinners, stage: TOURNAMENT_STAGE, stageLabel: label },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
      },
    }
  );
}
