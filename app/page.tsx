"use client";

import StatCounter from "@/components/StatCounter";
import { getFlag } from "@/lib/flags";
import {
  CHAMPION,
  FINAL,
  RECAP_STATS,
  TOURNAMENT_MOMENTS,
} from "@/lib/worldCupRecap";

export default function Home() {
  return (
    <main className="min-h-full pb-16">
      {/* Final score banner */}
      <section className="final-banner relative w-full overflow-hidden">
        <span className="watermark right-[-1.5rem] top-[-2rem] text-[10rem] sm:text-[14rem]">
          WC
        </span>
        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pt-10 pb-6 sm:pt-12">
          <div
            className="reveal flex items-center justify-between gap-3"
            style={{ animationDelay: "0s" }}
          >
            <span className="kicker">★ FIFA World Cup 2026 · Final</span>
            <span className="meta hidden sm:inline">{FINAL.dateLabel}</span>
          </div>

          <div
            className="reveal final-scoreboard mt-8"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="final-side">
              <span className="flag final-flag" aria-hidden>
                {getFlag(FINAL.home)}
              </span>
              <span className="display final-team">{FINAL.home}</span>
            </div>

            <div className="final-score-block">
              <div className="final-digits">
                <span className="font-mono">{FINAL.homeScore}</span>
                <span className="final-dash">–</span>
                <span className="font-mono">{FINAL.awayScore}</span>
              </div>
              <span className="meta meta-accent mt-2">Full Time</span>
            </div>

            <div className="final-side">
              <span className="flag final-flag" aria-hidden>
                {getFlag(FINAL.away)}
              </span>
              <span className="display final-team">{FINAL.away}</span>
            </div>
          </div>

          <p
            className="reveal meta mt-6 text-center text-[var(--muted)]"
            style={{ animationDelay: "0.22s" }}
          >
            {FINAL.venue}
          </p>
        </div>
        <hr className="masthead-rule mx-auto max-w-3xl" />
      </section>

      {/* Champions hero */}
      <section className="relative w-full overflow-hidden">
        <span className="watermark left-[-1rem] bottom-[-2rem] text-[11rem] sm:text-[16rem]">
          26
        </span>
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-start gap-10 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div className="max-w-lg">
            <span
              className="champion-seal reveal"
              style={{ animationDelay: "0.05s" }}
            >
              Champions
            </span>
            <h1
              className="display reveal mt-5 text-[3.25rem] sm:text-[5rem]"
              style={{ animationDelay: "0.12s" }}
            >
              <span className="flag mr-3 inline-block align-middle text-[0.55em]" aria-hidden>
                {getFlag(CHAMPION)}
              </span>
              {CHAMPION}
              <br />
              <span className="text-[var(--flame)]">Wins It All</span>
            </h1>
            <p
              className="reveal serif-it mt-4 text-lg text-[var(--muted)]"
              style={{ animationDelay: "0.28s" }}
            >
              One goal. Ninety minutes. A fourth star for La Roja — and a
              summer of hot takes stamped and shared.
            </p>
          </div>

          <div className="stat-circle shrink-0">
            <span className="font-mono text-[2.75rem] font-medium leading-none text-[var(--flame)]">
              <StatCounter value={RECAP_STATS[0].value} />
            </span>
            <span className="meta mt-1 max-w-[96px] text-center leading-tight">
              {RECAP_STATS[0].label}
            </span>
          </div>
        </div>
        <hr className="masthead-rule mx-auto max-w-3xl" />
      </section>

      <div className="mx-auto w-full max-w-3xl px-4">
        {/* Tournament stats */}
        <section className="py-12">
          <div className="mb-6 flex items-center gap-4">
            <span className="rule-line" />
            <span className="date-label">The Numbers</span>
            <span className="rule-line" />
          </div>

          <div className="stats-grid">
            {RECAP_STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="stat-tile reveal"
                style={{ animationDelay: `${0.08 + i * 0.07}s` }}
              >
                <span className="font-mono text-[2.4rem] font-medium leading-none text-[var(--ink)] sm:text-[2.75rem]">
                  <StatCounter value={stat.value} durationMs={900} />
                  {stat.suffix ?? ""}
                </span>
                <span className="meta mt-3 text-center leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tournament story */}
        <section className="pb-14">
          <div className="mb-6 flex items-center gap-4">
            <span className="rule-line" />
            <span className="date-label">How It Unfolded</span>
            <span className="rule-line" />
          </div>

          <ol className="moment-list">
            {TOURNAMENT_MOMENTS.map((moment, i) => (
              <li
                key={moment.round}
                className="moment-card reveal"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <span className="badge badge-final">{moment.round}</span>
                <h2 className="display mt-3 text-[1.65rem] sm:text-[1.9rem]">
                  {moment.headline}
                </h2>
                <p className="mt-2 text-[var(--muted)] leading-relaxed">
                  {moment.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing stamp */}
        <section className="closing-stamp mb-8 reveal" style={{ animationDelay: "0.2s" }}>
          <p className="display text-center text-[1.75rem] sm:text-[2.25rem]">
            Thanks for the takes.
          </p>
          <p className="serif-it mt-2 text-center text-[var(--muted)]">
            See you in 2030.
          </p>
        </section>
      </div>
    </main>
  );
}
