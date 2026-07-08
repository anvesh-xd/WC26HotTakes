import { getFlag } from "@/lib/flags";
import type { TournamentWinnerOdds as WinnerOdds } from "@/lib/kalshi";

interface TournamentWinnerOddsProps {
  winners: WinnerOdds[];
}

export default function TournamentWinnerOdds({
  winners,
}: TournamentWinnerOddsProps) {
  if (winners.length === 0) return null;

  return (
    <section className="animate-fade-up mt-12">
      <div className="mb-4 flex items-center gap-4">
        <span className="rule-line" />
        <span className="date-label">To Win the Tournament</span>
        <span className="rule-line" />
      </div>

      <div className="match-card p-4 sm:p-5">
        <p className="meta mb-4 text-[var(--muted)]">
          Kalshi market prices · remaining contenders
        </p>
        <ul className="space-y-2">
          {winners.map((entry) => (
            <li
              key={entry.team}
              className="flex items-center gap-3 border-b border-[var(--ink)]/8 pb-2 last:border-0 last:pb-0"
            >
              <span className="flag text-xl">{getFlag(entry.team)}</span>
              <span className="fixture-team flex-1">{entry.team}</span>
              <span className="kalshi-odds text-sm">{entry.winPct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
