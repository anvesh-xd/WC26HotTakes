import { forwardRef } from "react";
import { getFlag } from "@/lib/flags";
import { teamAbbrev } from "@/lib/kalshi";
import { gradePrediction, matchWinner, type PredictionGrade } from "@/lib/scoring";
import {
  isMatchLive,
  isMatchLocked,
  type Match,
} from "@/components/MatchCard";
import type { Predictions, Prediction } from "@/lib/useLocalStorage";

const SITE_URL = "WC26HOTTAKES.COM";
const SPLIT_THRESHOLD = 6;
const EMOJI_FONT = '"Noto Color Emoji", sans-serif';
const DISPLAY = "var(--font-anton), 'Arial Narrow', sans-serif";
const SERIF = "var(--font-fraunces), Georgia, serif";
const BODY = "var(--font-archivo), system-ui, sans-serif";
const MONO = "var(--font-dmmono), ui-monospace, monospace";

interface ShareCardProps {
  name: string;
  matches: Match[];
  predictions: Predictions;
}

const COLORS = {
  paper: "#F2E9D5",
  stock: "#FFF7EC",
  ink: "#1B1A17",
  flame: "#E8431F",
  cobalt: "#15485C",
  gold: "#C8881A",
  green: "#3DDB82",
  muted: "#6F6555",
  wrong: "#C0392B",
};

const GRADE_DISPLAY_COLOR: Record<PredictionGrade, string> = {
  exact: "#1f9d57",
  outcome: "#b07d12",
  wrong: "#c0392b",
};

const GRADE_LABEL: Record<PredictionGrade, string> = {
  exact: "✓ Exact Score",
  outcome: "~ Correct Winner",
  wrong: "✗ Wrong",
};

function ShareKalshiAdvanceBar({
  homeTeam,
  awayTeam,
  homePct,
  awayPct,
  compact,
}: {
  homeTeam: string;
  awayTeam: string;
  homePct: number;
  awayPct: number;
  compact?: boolean;
}) {
  const total = homePct + awayPct;
  const barPct = total > 0 ? (homePct / total) * 100 : 50;
  const homeCode = teamAbbrev(homeTeam);
  const awayCode = teamAbbrev(awayTeam);
  const labelSize = compact ? "7px" : "8px";
  const codeSize = compact ? "8px" : "9px";
  const pctSize = compact ? "9px" : "10px";
  const viaSize = compact ? "6px" : "7px";
  const gap = compact ? 3 : 4;

  const codeStyle = (color: string) =>
    ({
      fontFamily: MONO,
      fontSize: codeSize,
      fontWeight: 800,
      letterSpacing: "0.04em",
      color,
      lineHeight: 1.2,
      flexShrink: 0,
    }) as const;

  const pctStyle = (color: string) =>
    ({
      fontFamily: MONO,
      fontSize: pctSize,
      fontWeight: 800,
      fontVariantNumeric: "tabular-nums",
      color,
      lineHeight: 1.2,
      flexShrink: 0,
    }) as const;

  return (
    <div style={{ marginTop: compact ? "8px" : "10px" }}>
      <p
        style={{
          margin: "0 0 5px",
          textAlign: "center",
          fontSize: labelSize,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: COLORS.muted,
          lineHeight: 1.2,
        }}
      >
        To Advance
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: `${gap}px`,
        }}
      >
        <span style={codeStyle(COLORS.cobalt)}>{homeCode}</span>
        <span style={pctStyle(COLORS.cobalt)}>{homePct}%</span>
        <div
          style={{
            flex: "1 1 auto",
            minWidth: compact ? "36px" : "48px",
            maxWidth: compact ? "72px" : "96px",
            display: "flex",
            height: "4px",
            borderRadius: "100px",
            overflow: "hidden",
            backgroundColor: "rgba(27, 26, 23, 0.08)",
          }}
        >
          <div
            style={{
              width: `${barPct}%`,
              height: "100%",
              backgroundColor: COLORS.cobalt,
            }}
          />
          <div
            style={{
              width: `${100 - barPct}%`,
              height: "100%",
              backgroundColor: COLORS.gold,
            }}
          />
        </div>
        <span style={pctStyle(COLORS.gold)}>{awayPct}%</span>
        <span style={codeStyle(COLORS.gold)}>{awayCode}</span>
      </div>
      <p
        style={{
          margin: "5px 0 0",
          textAlign: "center",
          fontSize: viaSize,
          color: COLORS.muted,
          lineHeight: 1.2,
        }}
      >
        via Kalshi
      </p>
    </div>
  );
}

function MatchFixtureCard({
  match,
  pred,
  compact,
}: {
  match: Match;
  pred: Prediction;
  compact?: boolean;
}) {
  const isFinished = match.status === "FINISHED";
  const isLive = isMatchLive(match.status);
  const isLocked = isMatchLocked(match.status);
  const actualHome = match.score.home;
  const actualAway = match.score.away;
  const hasActual = isLocked && actualHome !== null && actualAway !== null;
  const gradeKey =
    isFinished && hasActual
      ? gradePrediction(pred, actualHome, actualAway)
      : null;
  const grade = gradeKey
    ? { label: GRADE_LABEL[gradeKey], color: GRADE_DISPLAY_COLOR[gradeKey] }
    : null;

  const winner =
    isFinished && hasActual
      ? matchWinner(actualHome, actualAway, match.penalties)
      : null;
  const liveLeader =
    isLive && hasActual ? matchWinner(actualHome, actualAway) : null;
  const homeScore = isLocked ? (actualHome ?? 0) : pred.home;
  const awayScore = isLocked ? (actualAway ?? 0) : pred.away;
  const hotTake = pred.hotTake?.trim();
  const hasPens =
    match.penalties?.home != null && match.penalties?.away != null;
  const showFooter = isFinished || Boolean(hotTake) || hasPens;

  const homeAdvance = match.kalshi?.homeAdvancePct ?? 0;
  const awayAdvance = match.kalshi?.awayAdvancePct ?? 0;
  const showKalshiAdvance =
    !isFinished &&
    !isLive &&
    homeAdvance > 0 &&
    awayAdvance > 0 &&
    match.homeTeam &&
    match.awayTeam;

  const homeScoreColor = isFinished
    ? COLORS.gold
    : isLive
      ? liveLeader === "home"
        ? COLORS.flame
        : "#3DDB82"
      : COLORS.flame;
  const awayScoreColor = isFinished
    ? COLORS.gold
    : isLive
      ? liveLeader === "away"
        ? COLORS.flame
        : "#3DDB82"
      : COLORS.flame;

  const teamSize = compact ? "13px" : "15px";
  const scoreSize = compact ? "18px" : "22px";
  const flagSize = compact ? "18px" : "20px";
  const cardPadding = compact ? "10px 12px" : "13px 18px";

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: compact ? "14px 22px 1fr auto" : "18px 28px 1fr auto",
    alignItems: "center",
    gap: compact ? "6px" : "8px",
    marginBottom: "6px",
  } as const;

  return (
    <div
      style={{
        backgroundColor: COLORS.stock,
        border: `2px solid ${COLORS.ink}`,
        borderRadius: "3px",
        boxShadow: `3px 3px 0 ${COLORS.ink}`,
        padding: cardPadding,
      }}
    >
      <div style={rowStyle}>
        <span
          style={{
            fontSize: compact ? "12px" : "14px",
            fontWeight: 800,
            color: COLORS.gold,
            textAlign: "center",
          }}
        >
          {winner === "home" ? "✓" : ""}
        </span>
        <span style={{ fontFamily: EMOJI_FONT, fontSize: flagSize }}>
          {getFlag(match.homeTeam)}
        </span>
        <span
          style={{
            fontSize: teamSize,
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1.15,
          }}
        >
          {match.homeTeam ?? "TBD"}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: scoreSize,
            fontWeight: 500,
            color: homeScoreColor,
          }}
        >
          {homeScore}
        </span>
      </div>

      <div style={{ ...rowStyle, marginBottom: 0 }}>
        <span
          style={{
            fontSize: compact ? "12px" : "14px",
            fontWeight: 800,
            color: COLORS.gold,
            textAlign: "center",
          }}
        >
          {winner === "away" ? "✓" : ""}
        </span>
        <span style={{ fontFamily: EMOJI_FONT, fontSize: flagSize }}>
          {getFlag(match.awayTeam)}
        </span>
        <span
          style={{
            fontSize: teamSize,
            fontWeight: 800,
            textTransform: "uppercase",
            lineHeight: 1.15,
          }}
        >
          {match.awayTeam ?? "TBD"}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: scoreSize,
            fontWeight: 500,
            color: awayScoreColor,
          }}
        >
          {awayScore}
        </span>
      </div>

      {showKalshiAdvance && (
        <ShareKalshiAdvanceBar
          homeTeam={match.homeTeam!}
          awayTeam={match.awayTeam!}
          homePct={homeAdvance}
          awayPct={awayAdvance}
          compact={compact}
        />
      )}

      {showFooter && (
        <div
          style={{
            marginTop: compact ? "8px" : "10px",
            paddingTop: compact ? "7px" : "9px",
            borderTop: `1px dashed ${COLORS.muted}`,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {isFinished && (
            <span
              style={{
                fontSize: compact ? "9px" : "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: COLORS.muted,
              }}
            >
              You predicted: {pred.home} – {pred.away}
            </span>
          )}
          {grade && (
            <span
              style={{
                fontSize: compact ? "9px" : "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: grade.color,
              }}
            >
              {grade.label}
            </span>
          )}
          {isFinished && hasPens && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: compact ? "9px" : "10px",
                fontWeight: 500,
                color: COLORS.muted,
                textTransform: "uppercase",
              }}
            >
              Pens {match.penalties!.home}–{match.penalties!.away}
            </span>
          )}
          {hotTake && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: compact ? "12px" : "15px",
                color: COLORS.cobalt,
                lineHeight: 1.3,
                textAlign: "center",
                marginTop: "4px",
              }}
            >
              “{hotTake}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Rendered off-screen and captured to PNG by html2canvas. Uses inline hex
// styles (not Tailwind utilities) so the capture doesn't choke on oklch colors.
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { name, matches, predictions },
  ref
) {
  const predicted = matches.filter((m) => predictions[String(m.id)]);
  const displayName = name.trim() ? `${name.trim()}'s` : "Your";
  const useTwoColumns = predicted.length > SPLIT_THRESHOLD;
  const splitAt = Math.ceil(predicted.length / 2);
  const columns = useTwoColumns
    ? [predicted.slice(0, splitAt), predicted.slice(splitAt)]
    : [predicted];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: useTwoColumns ? "900px" : "680px",
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        fontFamily: BODY,
        padding: useTwoColumns ? "36px" : "44px",
        boxSizing: "border-box",
        border: `3px solid ${COLORS.ink}`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          marginBottom: useTwoColumns ? "22px" : "28px",
          borderBottom: `3px solid ${COLORS.ink}`,
          paddingBottom: useTwoColumns ? "14px" : "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: COLORS.flame,
            }}
          >
            {matches[0]?.stageLabel ?? "Quarter-final"}
          </span>
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: useTwoColumns ? "48px" : "58px",
            lineHeight: 0.9,
            textTransform: "uppercase",
            letterSpacing: "0.01em",
          }}
        >
          World Cup <span style={{ color: COLORS.flame }}>2026</span>
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: useTwoColumns ? "18px" : "20px",
            color: COLORS.muted,
            marginTop: "8px",
          }}
        >
          {displayName} picks
        </div>
      </div>

      <div
        style={
          useTwoColumns
            ? {
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "14px",
              }
            : {
                display: "block",
              }
        }
      >
        {columns.map((columnMatches, columnIndex) => (
          <div
            key={columnIndex}
            style={
              useTwoColumns
                ? {
                    flex: "1 1 0",
                    minWidth: 0,
                    width: "408px",
                    backgroundColor: COLORS.stock,
                    border: `2px solid ${COLORS.ink}`,
                    borderRadius: "3px",
                    boxShadow: `3px 3px 0 ${COLORS.ink}`,
                    padding: "12px",
                    boxSizing: "border-box",
                  }
                : { display: "block" }
            }
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: useTwoColumns ? "8px" : "10px",
              }}
            >
              {columnMatches.map((match) => (
                <MatchFixtureCard
                  key={match.id}
                  match={match}
                  pred={predictions[String(match.id)]}
                  compact={useTwoColumns}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: useTwoColumns ? "22px" : "28px",
          paddingTop: useTwoColumns ? "14px" : "18px",
          borderTop: `3px solid ${COLORS.ink}`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: COLORS.flame,
          }}
        >
          {SITE_URL}
        </span>
      </div>
    </div>
  );
});

export default ShareCard;
