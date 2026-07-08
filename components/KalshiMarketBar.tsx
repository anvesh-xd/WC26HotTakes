"use client";

import { useEffect, useState } from "react";
import type { MatchKalshiOdds } from "@/components/MatchCard";

interface KalshiMarketBarProps {
  odds: MatchKalshiOdds;
}

export default function KalshiMarketBar({ odds }: KalshiMarketBarProps) {
  const homePct = odds.homeWinPct ?? 0;
  const awayPct = odds.awayWinPct ?? 0;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(id);
  }, [homePct, awayPct]);

  if (homePct <= 0 && awayPct <= 0) return null;

  return (
    <div className="kalshi-market">
      <p className="kalshi-market-label">Market Odds</p>
      <div className="kalshi-market-row">
        <span
          className={`kalshi-market-pct${homePct > 50 ? " is-leading" : ""}`}
        >
          {homePct}%
        </span>
        <div className="kalshi-market-bar">
          <div
            className="kalshi-market-bar-fill"
            style={{ width: animate ? `${homePct}%` : "0%" }}
          />
        </div>
        <span
          className={`kalshi-market-pct${awayPct > 50 ? " is-leading" : ""}`}
        >
          {awayPct}%
        </span>
      </div>
      <p className="kalshi-market-via">via Kalshi</p>
    </div>
  );
}
