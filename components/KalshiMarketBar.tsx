"use client";

import { useEffect, useState } from "react";
import { teamAbbrev } from "@/lib/kalshi";

interface KalshiMarketBarProps {
  homeTeam: string;
  awayTeam: string;
  homePct: number;
  awayPct: number;
}

export default function KalshiMarketBar({
  homeTeam,
  awayTeam,
  homePct,
  awayPct,
}: KalshiMarketBarProps) {
  const total = homePct + awayPct;
  const barPct = total > 0 ? (homePct / total) * 100 : 50;
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
      <p className="kalshi-market-label">To Advance</p>
      <div className="kalshi-market-row">
        <span className="kalshi-market-code kalshi-market-code--home">
          {teamAbbrev(homeTeam)}
        </span>
        <span className="kalshi-market-pct kalshi-market-pct--home">
          {homePct}%
        </span>
        <div className="kalshi-market-bar">
          <div
            className="kalshi-market-bar-fill kalshi-market-bar-fill--home"
            style={{ width: animate ? `${barPct}%` : "0%" }}
          />
          <div
            className="kalshi-market-bar-fill kalshi-market-bar-fill--away"
            style={{ width: animate ? `${100 - barPct}%` : "0%" }}
          />
        </div>
        <span className="kalshi-market-pct kalshi-market-pct--away">
          {awayPct}%
        </span>
        <span className="kalshi-market-code kalshi-market-code--away">
          {teamAbbrev(awayTeam)}
        </span>
      </div>
      <p className="kalshi-market-via">via Kalshi</p>
    </div>
  );
}
