const KALSHI_BASE = "https://external-api.kalshi.com/trade-api/v2";
const ADVANCE_SERIES = "KXWCROUND";
const WINNER_SERIES = "KXMENWORLDCUP";

export interface MatchKalshiOdds {
  homeAdvancePct: number | null;
  awayAdvancePct: number | null;
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

function buildAdvanceOddsByTeam(
  markets: KalshiMarket[],
  roundKey: string
): Map<string, number> {
  const prefix = `KXWCROUND-${roundKey}-`;
  const byTeam = new Map<string, number>();

  for (const market of markets) {
    if (!market.ticker.startsWith(prefix)) continue;
    const team = market.yes_sub_title?.trim();
    if (!team) continue;
    byTeam.set(team, priceToPct(market));
  }

  return byTeam;
}

export function matchKalshiAdvanceOdds(
  homeTeam: string | null,
  awayTeam: string | null,
  advanceOddsByTeam: Map<string, number>
): MatchKalshiOdds | null {
  if (!homeTeam || !awayTeam) return null;

  const homeAdvancePct = advanceOddsByTeam.get(homeTeam) ?? null;
  const awayAdvancePct = advanceOddsByTeam.get(awayTeam) ?? null;

  if (homeAdvancePct == null && awayAdvancePct == null) return null;

  return { homeAdvancePct, awayAdvancePct };
}

async function fetchKalshiMarkets(seriesTicker: string): Promise<KalshiMarket[]> {
  const url = `${KALSHI_BASE}/markets?series_ticker=${seriesTicker}&status=open&limit=200`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data: KalshiMarketsResponse = await res.json();
  return data.markets ?? [];
}

export async function fetchKalshiData(advanceRoundKey: string | null): Promise<{
  advanceOddsByTeam: Map<string, number>;
  tournamentWinners: TournamentWinnerOdds[];
}> {
  const [advanceMarkets, winnerMarkets] = await Promise.all([
    advanceRoundKey ? fetchKalshiMarkets(ADVANCE_SERIES) : Promise.resolve([]),
    fetchKalshiMarkets(WINNER_SERIES),
  ]);

  const advanceOddsByTeam = advanceRoundKey
    ? buildAdvanceOddsByTeam(advanceMarkets, advanceRoundKey)
    : new Map<string, number>();

  const tournamentWinners = winnerMarkets
    .map((market) => ({
      team: market.yes_sub_title?.trim() || market.title || "Unknown",
      winPct: priceToPct(market),
    }))
    .filter((entry) => entry.winPct > 0)
    .sort((a, b) => b.winPct - a.winPct);

  return { advanceOddsByTeam, tournamentWinners };
}
