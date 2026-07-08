const KALSHI_BASE = "https://external-api.kalshi.com/trade-api/v2";
const GAME_SERIES = "KXWCGAME";
const WINNER_SERIES = "KXMENWORLDCUP";

/** football-data.org name → Kalshi KXWCGAME market suffix */
const TEAM_TO_GAME_CODE: Record<string, string> = {
  Argentina: "ARG",
  Belgium: "BEL",
  England: "ENG",
  France: "FRA",
  Morocco: "MAR",
  Norway: "NOR",
  Spain: "ESP",
  Switzerland: "SUI",
};

export interface MatchKalshiOdds {
  homeWinPct: number | null;
  awayWinPct: number | null;
  drawPct: number | null;
}

export interface TournamentWinnerOdds {
  team: string;
  winPct: number;
}

interface KalshiMarket {
  event_ticker: string;
  ticker: string;
  title?: string;
  yes_sub_title?: string;
  yes_bid_dollars?: string;
  last_price_dollars?: string;
}

interface KalshiMarketsResponse {
  markets?: KalshiMarket[];
}

function priceToPct(market: KalshiMarket): number {
  const raw = market.last_price_dollars ?? market.yes_bid_dollars;
  if (!raw) return 0;
  return Math.round(parseFloat(raw) * 100);
}

function teamGameCode(name: string | null): string | null {
  if (!name) return null;
  return TEAM_TO_GAME_CODE[name] ?? null;
}

/** e.g. KXWCGAME-26JUL09FRAMAR → { home: "FRA", away: "MAR" } */
function parseGameEventTeams(eventTicker: string): {
  home: string;
  away: string;
} | null {
  const body = eventTicker.replace(/^KXWCGAME-/, "");
  const teamsPart = body.slice(7);
  if (teamsPart.length !== 6) return null;
  return { home: teamsPart.slice(0, 3), away: teamsPart.slice(3) };
}

function buildGameOddsByEvent(
  markets: KalshiMarket[]
): Map<string, Record<string, number>> {
  const byEvent = new Map<string, Record<string, number>>();
  for (const market of markets) {
    const code = market.ticker.split("-").pop();
    if (!code) continue;
    const existing = byEvent.get(market.event_ticker) ?? {};
    existing[code] = priceToPct(market);
    byEvent.set(market.event_ticker, existing);
  }
  return byEvent;
}

export function matchKalshiGameOdds(
  homeTeam: string | null,
  awayTeam: string | null,
  oddsByEvent: Map<string, Record<string, number>>
): MatchKalshiOdds | null {
  const homeCode = teamGameCode(homeTeam);
  const awayCode = teamGameCode(awayTeam);
  if (!homeCode || !awayCode) return null;

  for (const [eventTicker, odds] of oddsByEvent) {
    const parsed = parseGameEventTeams(eventTicker);
    if (!parsed) continue;

    const teamsMatch =
      (parsed.home === homeCode && parsed.away === awayCode) ||
      (parsed.home === awayCode && parsed.away === homeCode);
    if (!teamsMatch) continue;

    return {
      homeWinPct: odds[homeCode] ?? null,
      awayWinPct: odds[awayCode] ?? null,
      drawPct: odds.TIE ?? null,
    };
  }

  return null;
}

async function fetchKalshiMarkets(seriesTicker: string): Promise<KalshiMarket[]> {
  const url = `${KALSHI_BASE}/markets?series_ticker=${seriesTicker}&status=open&limit=200`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data: KalshiMarketsResponse = await res.json();
  return data.markets ?? [];
}

export async function fetchKalshiData(): Promise<{
  gameOddsByEvent: Map<string, Record<string, number>>;
  tournamentWinners: TournamentWinnerOdds[];
}> {
  const [gameMarkets, winnerMarkets] = await Promise.all([
    fetchKalshiMarkets(GAME_SERIES),
    fetchKalshiMarkets(WINNER_SERIES),
  ]);

  const gameOddsByEvent = buildGameOddsByEvent(gameMarkets);

  const tournamentWinners = winnerMarkets
    .map((market) => ({
      team: market.yes_sub_title?.trim() || market.title || "Unknown",
      winPct: priceToPct(market),
    }))
    .filter((entry) => entry.winPct > 0)
    .sort((a, b) => b.winPct - a.winPct);

  return { gameOddsByEvent, tournamentWinners };
}
