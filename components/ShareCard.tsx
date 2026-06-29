import { forwardRef } from "react";
import { getFlag } from "@/lib/flags";
import { gradePrediction, type PredictionGrade } from "@/lib/scoring";
import type { Match } from "@/components/MatchCard";
import type { Predictions } from "@/lib/useLocalStorage";

const SITE_URL = "worldcup-hottakes.vercel.app";
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

const GRADE_DISPLAY: Record<
  PredictionGrade,
  { mark: string; color: string }
> = {
  exact: { mark: "✓", color: "#1f9d57" },
  outcome: { mark: "~", color: "#b07d12" },
  wrong: { mark: "✗", color: "#c0392b" },
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
          const actualHome = match.score.home;
          const actualAway = match.score.away;
          const hasActual =
            isFinished && actualHome !== null && actualAway !== null;
          const grade = hasActual
            ? GRADE_DISPLAY[gradePrediction(pred, actualHome, actualAway)]
            : null;

          const hotTake = pred.hotTake?.trim();

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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
              {/* home */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "8px",
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {match.homeTeam ?? "TBD"}
                </span>
                <span style={{ fontFamily: EMOJI_FONT, fontSize: "22px" }}>
                  {getFlag(match.homeTeam)}
                </span>
              </div>

              {/* score */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  minWidth: "86px",
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: "26px",
                    fontWeight: 500,
                    color: COLORS.flame,
                    whiteSpace: "nowrap",
                  }}
                >
                  {pred.home} <span style={{ color: COLORS.muted }}>–</span>{" "}
                  {pred.away}
                </div>
                {grade && (
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: "12px",
                      fontWeight: 500,
                      color: grade.color,
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {grade.mark} {actualHome}–{actualAway}
                  </div>
                )}
              </div>

              {/* away */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "8px",
                  textAlign: "left",
                }}
              >
                <span style={{ fontFamily: EMOJI_FONT, fontSize: "22px" }}>
                  {getFlag(match.awayTeam)}
                </span>
                <span
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {match.awayTeam ?? "TBD"}
                </span>
              </div>
              </div>

              {hotTake && (
                <div
                  style={{
                    marginTop: "10px",
                    paddingTop: "9px",
                    borderTop: `1px dashed ${COLORS.muted}`,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: COLORS.cobalt,
                    lineHeight: 1.3,
                    textAlign: "center",
                  }}
                >
                  “{hotTake}”
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
