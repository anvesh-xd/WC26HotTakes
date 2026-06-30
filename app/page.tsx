"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MatchCard, { type Match } from "@/components/MatchCard";
import NameInput from "@/components/NameInput";
import ShareCard from "@/components/ShareCard";
import StatCounter from "@/components/StatCounter";
import { trackCardStamped } from "@/lib/analytics";
import { useLocalStorage } from "@/lib/useLocalStorage";

function dateLabel(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface DateGroup {
  label: string;
  matches: Match[];
}

function groupByDate(matches: Match[]): DateGroup[] {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  );

  const groups: DateGroup[] = [];
  for (const match of sorted) {
    const label = dateLabel(match.utcDate);
    const existing = groups[groups.length - 1];
    if (existing && existing.label === label) {
      existing.matches.push(match);
    } else {
      groups.push({ label, matches: [match] });
    }
  }
  return groups;
}

export default function Home() {
  const { name, setName, predictions, setPrediction } = useLocalStorage();
  const [matches, setMatches] = useState<Match[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const handlePredict = useCallback(
    (matchId: number, home: number, away: number, hotTake: string) => {
      setPrediction(matchId, home, away, hotTake);
    },
    [setPrediction]
  );

  const MATCHES_POLL_MS = 60_000;

  useEffect(() => {
    let active = true;

    async function loadMatches(isInitial: boolean) {
      try {
        const res = await fetch("/api/matches", {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data: { matches: Match[] } = await res.json();
        if (!active) return;
        setMatches(data.matches ?? []);
        setStatus("ready");
      } catch {
        if (!active) return;
        if (isInitial) setStatus("error");
      }
    }

    loadMatches(true);

    const interval = window.setInterval(
      () => loadMatches(false),
      MATCHES_POLL_MS
    );

    const onVisibility = () => {
      if (document.visibilityState === "visible") loadMatches(false);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const groups = useMemo(() => groupByDate(matches), [matches]);
  const predictionCount = Object.keys(predictions).length;
  const hasPredictions = predictionCount > 0;

  const shareRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!shareRef.current) return;

    // Blur any focused input so pending debounced saves flush before capture.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await new Promise((resolve) => setTimeout(resolve, 350));

    setDownloading(true);
    const el = shareRef.current;
    const style = el.style;
    const captureSnapshot = {
      position: style.position,
      left: style.left,
      top: style.top,
      visibility: style.visibility,
      zIndex: style.zIndex,
      opacity: style.opacity,
      pointerEvents: style.pointerEvents,
    };

    try {
      // html2canvas cannot paint visibility:hidden / opacity:0 nodes — keep the
      // card fully visible but parked behind the page while layout is measured.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      style.position = "fixed";
      style.left = "0";
      style.top = "0";
      style.visibility = "visible";
      style.opacity = "1";
      style.zIndex = "-1";
      style.pointerEvents = "none";
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const html2canvas = (await import("html2canvas")).default;
      const isWide = el.offsetWidth > 700;
      const canvas = await html2canvas(el, {
        backgroundColor: "#F2E9D5",
        scale: isWide ? 1.5 : 2,
        useCORS: true,
        logging: false,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Could not generate image");

      const file = new File([blob], "worldcup-picks.png", {
        type: "image/png",
      });

      const sharePayload = {
        files: [file],
        title: "My World Cup 2026 Picks",
        text: "My World Cup 2026 Round of 32 predictions 🔮",
      };

      // Prefer native share on phones/tablets. Skip canShare when absent;
      // on some devices canShare returns false for large PNGs even though
      // share() still works.
      const isMobileShare =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      if (isMobileShare) {
        try {
          await navigator.share(sharePayload);
          trackCardStamped(predictionCount, "share");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      } else if (
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare(sharePayload))
      ) {
        try {
          await navigator.share(sharePayload);
          trackCardStamped(predictionCount, "share");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "worldcup-picks.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      trackCardStamped(predictionCount, "download");
    } catch (err) {
      console.error("Card export failed:", err);
      alert("Sorry, the card couldn't be generated. Please try again.");
    } finally {
      Object.assign(style, captureSnapshot);
      setDownloading(false);
    }
  }

  return (
    <main className="min-h-full pb-32">
      {/* hero / masthead */}
      <section className="relative w-full overflow-hidden">
        <span className="watermark right-[-2rem] top-[-3rem] text-[12rem] sm:text-[18rem]">
          26
        </span>
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-start gap-10 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:py-16">
          <div className="max-w-lg">
            <span
              className="kicker reveal"
              style={{ animationDelay: "0s" }}
            >
              ★ FIFA World Cup 2026
            </span>
            <h1
              className="display reveal mt-5 text-[3rem] sm:text-[4.75rem]"
              style={{ animationDelay: "0.08s" }}
            >
              Make Your
              <br />
              <span className="text-[var(--flame)]">Predictions</span>
            </h1>
            <p
              className="reveal serif-it mt-4 text-lg text-[var(--muted)]"
              style={{ animationDelay: "0.24s" }}
            >
              Pick the score for every Round of 32 fixture. Stamp your card.
              Share it.
            </p>
          </div>

          <div className="stat-circle shrink-0">
            <span className="font-mono text-[2.75rem] font-medium leading-none text-[var(--flame)]">
              <StatCounter value={predictionCount} />
            </span>
            <span className="meta mt-1 max-w-[84px] text-center leading-tight">
              Picks Logged
            </span>
          </div>
        </div>
        <hr className="masthead-rule mx-auto max-w-3xl" />
      </section>

      <div className="mx-auto w-full max-w-3xl px-4">
        {/* name input */}
        <div className="-mt-2 mb-10">
          <NameInput value={name} onChange={setName} />
        </div>

        {/* feed states */}
        {status === "loading" && (
          <p className="meta py-8 text-center">Loading fixtures…</p>
        )}

        {status === "error" && (
          <div className="match-card p-5">
            <p className="text-lg font-bold">Couldn&apos;t load fixtures</p>
            <p className="mt-1 text-[var(--muted)]">
              Check that a valid{" "}
              <code className="text-[var(--pitch)]">FOOTBALL_DATA_API_KEY</code>{" "}
              is set in <code>.env.local</code>.
            </p>
          </div>
        )}

        {status === "ready" && groups.length === 0 && (
          <p className="meta py-8 text-center">
            No Round of 32 fixtures available yet.
          </p>
        )}

        {/* date groups */}
        <div className="space-y-10">
          {groups.map((group, i) => (
            <section
              key={group.label}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="mb-4 flex items-center gap-4">
                <span className="rule-line" />
                <span className="date-label">{group.label}</span>
                <span className="rule-line" />
              </div>
              <div className="space-y-3">
                {group.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictions[String(match.id)]}
                    onPredict={handlePredict}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* off-screen card captured by html2canvas — only mounted once the user
          has predictions (it's a heavy, hidden subtree we don't want in the
          initial paint for first-time visitors) */}
      {hasPredictions && (
        <ShareCard
          ref={shareRef}
          name={name}
          matches={matches}
          predictions={predictions}
        />
      )}

      {/* sticky CTA */}
      {hasPredictions && (
        <div className="cta-bar fixed inset-x-0 bottom-0 z-20 border-t-2 border-[var(--ink)] bg-[var(--bg)] px-4 pb-5 pt-4">
          <div className="mx-auto w-full max-w-[420px]">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="cta-button w-full"
            >
              {downloading ? "Stamping…" : "Stamp My Card"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
