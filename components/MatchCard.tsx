"use client";

import { useEffect, useRef, useState } from "react";
import { getFlag } from "@/lib/flags";
import { gradePrediction, type PredictionGrade } from "@/lib/scoring";
import type { Prediction } from "@/lib/useLocalStorage";

export type MatchStatus = "SCHEDULED" | "TIMED" | "IN_PLAY" | "FINISHED";

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  homeTeam: string | null;
  awayTeam: string | null;
  score: { home: number | null; away: number | null };
}

const MAX_HOT_TAKE = 140;

const GRADE_BADGE: Record<
  PredictionGrade,
  { label: string; bg: string; color: string }
> = {
  exact: { label: "✓ Exact Score", bg: "rgba(61,219,130,0.12)", color: "#3DDB82" },
  outcome: {
    label: "~ Correct Result",
    bg: "rgba(245,200,66,0.12)",
    color: "#F5C842",
  },
  wrong: { label: "✗ Wrong", bg: "rgba(255,77,77,0.1)", color: "#FF6B6B" },
};

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict: (home: number, away: number, hotTake: string) => void;
}

// Renders kickoff in the viewer's own locale + timezone, with the local zone
// abbreviation appended (e.g. "11:00 AM EDT") so it's clear it's their time.
function kickoffTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function sanitize(raw: string): string {
  return raw.replace(/[^0-9]/g, "").slice(0, 2);
}

export default function MatchCard({
  match,
  prediction,
  onPredict,
}: MatchCardProps) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY";
  const isLocked = isFinished || isLive;

  const [home, setHome] = useState(prediction ? String(prediction.home) : "");
  const [away, setAway] = useState(prediction ? String(prediction.away) : "");
  const [hotTake, setHotTake] = useState(prediction?.hotTake ?? "");
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHome(prediction ? String(prediction.home) : "");
    setAway(prediction ? String(prediction.away) : "");
    setHotTake(prediction?.hotTake ?? "");
  }, [prediction?.home, prediction?.away, prediction?.hotTake]);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function save(nextHome: string, nextAway: string, nextHotTake: string) {
    onPredict(
      nextHome === "" ? 0 : parseInt(nextHome, 10),
      nextAway === "" ? 0 : parseInt(nextAway, 10),
      nextHotTake
    );
  }

  function commit(nextHome: string, nextAway: string) {
    setHome(nextHome);
    setAway(nextAway);
    save(nextHome, nextAway, hotTake);

    if (nextHome !== "" && nextAway !== "") {
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1500);
    }
  }

  function commitHotTake(next: string) {
    setHotTake(next);
    save(home, away, next);
  }

  const counterColor =
    hotTake.length > MAX_HOT_TAKE
      ? "#FF5252"
      : hotTake.length > 0
        ? "var(--pitch)"
        : "var(--muted)";

  const blockNegativeKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
  };

  const scoreColor = isLive ? "var(--pitch)" : "var(--gold)";

  const hasActualScore =
    isFinished && match.score.home !== null && match.score.away !== null;
  const grade: PredictionGrade | null =
    hasActualScore && prediction
      ? gradePrediction(prediction, match.score.home!, match.score.away!)
      : null;
  const gradeBadge = grade ? GRADE_BADGE[grade] : null;

  return (
    <div
      className={`match-card p-4 sm:p-5 ${
        saved && !isLocked ? "is-saved" : ""
      } ${grade === "exact" ? "is-exact" : ""}`}
    >
      {/* top row: stage + status/kickoff */}
      <div className="mb-4 flex items-center justify-between">
        <span className="meta meta-accent">Round of 32</span>
        {isFinished &&
          (gradeBadge ? (
            <span
              className="badge"
              style={{
                backgroundColor: gradeBadge.bg,
                color: gradeBadge.color,
                borderColor: gradeBadge.color,
              }}
            >
              {gradeBadge.label}
            </span>
          ) : (
            <span className="badge badge-final">Final</span>
          ))}
        {isLive && (
          <span className="badge badge-live">
            <span className="live-dot" />
            Live
          </span>
        )}
        {!isLocked && <span className="meta">{kickoffTime(match.utcDate)}</span>}
      </div>

      {/* middle row: team | score | team */}
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
        {/* home */}
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <span className="text-sm font-extrabold uppercase leading-tight tracking-tight sm:text-base">
            {match.homeTeam ?? "TBD"}
          </span>
          <span className="flag text-2xl">{getFlag(match.homeTeam)}</span>
        </div>

        {/* center */}
        <div className="relative flex items-center justify-center gap-2">
          {isLocked ? (
            <div className="flex flex-col items-center gap-1">
              <div
                className="score-result flex items-center gap-2"
                style={{ color: scoreColor }}
              >
                <span>{match.score.home ?? 0}</span>
                <span style={{ color: "var(--muted)" }}>–</span>
                <span>{match.score.away ?? 0}</span>
              </div>
              {isFinished && prediction && (
                <span
                  className="text-[0.66rem] font-medium uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  You predicted: {prediction.home} – {prediction.away}
                </span>
              )}
            </div>
          ) : (
            <>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`${match.homeTeam ?? "Home"} score`}
                value={home}
                onKeyDown={blockNegativeKeys}
                onChange={(e) => commit(sanitize(e.target.value), away)}
                className="score-input"
              />
              <span
                className="text-xl font-extrabold"
                style={{ color: "var(--muted)" }}
              >
                –
              </span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`${match.awayTeam ?? "Away"} score`}
                value={away}
                onKeyDown={blockNegativeKeys}
                onChange={(e) => commit(home, sanitize(e.target.value))}
                className="score-input"
              />
              {saved && (
                <span
                  className="check-saved absolute -right-5 text-lg font-bold"
                  style={{ color: "var(--pitch)" }}
                  aria-hidden
                >
                  ✓
                </span>
              )}
            </>
          )}
        </div>

        {/* away */}
        <div className="flex items-center justify-center gap-2 sm:justify-start">
          <span className="flag text-2xl">{getFlag(match.awayTeam)}</span>
          <span className="text-sm font-extrabold uppercase leading-tight tracking-tight sm:text-base">
            {match.awayTeam ?? "TBD"}
          </span>
        </div>
      </div>

      {/* hot take input for upcoming matches */}
      {!isLocked && (
        <div className="mt-4">
          <input
            type="text"
            maxLength={MAX_HOT_TAKE}
            value={hotTake}
            onChange={(e) => commitHotTake(e.target.value)}
            placeholder="Your hot take..."
            aria-label="Your hot take"
            className="hot-take-input"
          />
          <div
            className="mt-1 text-right text-xs font-medium"
            style={{ color: counterColor }}
          >
            {hotTake.length}/{MAX_HOT_TAKE}
          </div>
        </div>
      )}

      {/* submitted hot take on finished matches */}
      {isFinished && prediction?.hotTake && (
        <p
          className="mt-3 text-center text-sm italic"
          style={{ color: "var(--muted)" }}
        >
          “{prediction.hotTake}”
        </p>
      )}
    </div>
  );
}
