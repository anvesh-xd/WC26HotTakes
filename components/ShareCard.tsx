import { forwardRef } from "react";
import { getFlag } from "@/lib/flags";
import { gradePrediction, matchWinner, type PredictionGrade } from "@/lib/scoring";
import type { Match } from "@/components/MatchCard";
import type { Predictions } from "@/lib/useLocalStorage";

const SITE_URL = "wc26hottakes.com";
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

// Rendered off-screen and captured to PNG by html2canvas. Uses inline hex
// styles (not Tailwind utilities) so the capture doesn't choke on oklch colors.
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { name, matches, predictions },
  ref
) {
  const predicted = matches.filter((m) => predictions[String(m.id)]);
  const displayName = name.trim() ? `${name.trim()}'s` : "Your";

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: "680px",
        backgroundColor: COLORS.paper,
        color: COLORS.ink,
        fontFamily: BODY,
        padding: "44px",
        boxSizing: "border-box",
        border: `3px solid ${COLORS.ink}`,
        borderRadius: "4px",
      }}
    >
      {/* header / masthead */}
      <div
        style={{
          marginBottom: "28px",
          borderBottom: `3px solid ${COLORS.ink}`,
          paddingBottom: "18px",
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
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "18px",
              color: COLORS.cobalt,
            }}
          >
            The Matchday Almanac
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: COLORS.flame,
            }}
          >
            Round of 32
          </span>
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: "58px",
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
            fontSize: "20px",
            color: COLORS.muted,
            marginTop: "8px",
          }}
        >
          {displayName} picks
        </div>
      </div>

      {/* predictions list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
        {predicted.map((match) => {
          const pred = predictions[String(match.id)];
          const isFinished = match.status === "FINISHED";
          const isLive = match.status === "IN_PLAY";
          const isLocked = isFinished || isLive;
          const actualHome = match.score.home;
          const actualAway = match.score.away;
          const hasActual =
            isLocked && actualHome !== null && actualAway !== null;
          const gradeKey = isFinished && hasActual
            ? gradePrediction(pred, actualHome, actualAway)
            : null;
          const grade = gradeKey
            ? { label: GRADE_LABEL[gradeKey], color: GRADE_DISPLAY_COLOR[gradeKey] }
            : null;

          const winner = isFinished && hasActual
            ? matchWinner(actualHome, actualAway)
            : null;
          const liveLeader =
            isLive && hasActual ? matchWinner(actualHome, actualAway) : null;
          const homeScore = isLocked ? (actualHome ?? 0) : pred.home;
          const awayScore = isLocked ? (actualAway ?? 0) : pred.away;
          const hotTake = pred.hotTake?.trim();
          const hasPens =
            match.penalties?.home != null && match.penalties?.away != null;
          const showFooter = isFinished || Boolean(hotTake) || hasPens;

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

          const rowStyle = {
            display: "grid",
            gridTemplateColumns: "18px 28px 1fr auto",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          } as const;

          return (
            <div
              key={match.id}
              style={{
                backgroundColor: COLORS.stock,
                border: `2px solid ${COLORS.ink}`,
                borderRadius: "3px",
                boxShadow: `3px 3px 0 ${COLORS.ink}`,
                padding: "13px 18px",
              }}
            >
              {/* home row */}
              <div style={rowStyle}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: COLORS.gold,
                    textAlign: "center",
                  }}
                >
                  {winner === "home" ? "✓" : ""}
                </span>
                <span style={{ fontFamily: EMOJI_FONT, fontSize: "20px" }}>
                  {getFlag(match.homeTeam)}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {match.homeTeam ?? "TBD"}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "22px",
                    fontWeight: 500,
                    color: homeScoreColor,
                  }}
                >
                  {homeScore}
                </span>
              </div>

              {/* away row */}
              <div style={{ ...rowStyle, marginBottom: 0 }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 800,
                    color: COLORS.gold,
                    textAlign: "center",
                  }}
                >
                  {winner === "away" ? "✓" : ""}
                </span>
                <span style={{ fontFamily: EMOJI_FONT, fontSize: "20px" }}>
                  {getFlag(match.awayTeam)}
                </span>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {match.awayTeam ?? "TBD"}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "22px",
                    fontWeight: 500,
                    color: awayScoreColor,
                  }}
                >
                  {awayScore}
                </span>
              </div>

              {/* footer: prediction, grade, pens, hot take */}
              {showFooter && (
              <div
                style={{
                  marginTop: "10px",
                  paddingTop: "9px",
                  borderTop: `1px dashed ${COLORS.muted}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {isFinished && (
                  <span
                    style={{
                      fontSize: "11px",
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
                      fontSize: "11px",
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
                        fontSize: "10px",
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
                      fontSize: "15px",
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
        })}
      </div>

      {/* footer */}
      <div
        style={{
          marginTop: "28px",
          paddingTop: "18px",
          borderTop: `3px solid ${COLORS.ink}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "15px",
            color: COLORS.muted,
          }}
        >
          Predictions, sealed.
        </span>
      </div>
    </div>
  );
});

export default ShareCard;
