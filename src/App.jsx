import { useCallback, useEffect, useState } from "react";
import { PREFIX } from "./lib/constants.js";
import { useDrill } from "./lib/useDrill.js";
import Rail from "./components/Rail.jsx";
import TopBar from "./components/TopBar.jsx";
import Summary from "./components/Summary.jsx";
import McqCard from "./components/McqCard.jsx";
import TfCard from "./components/TfCard.jsx";
import BlankCard from "./components/BlankCard.jsx";
import MatchCard from "./components/MatchCard.jsx";
import ShortCard from "./components/ShortCard.jsx";

function prefersDark() {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function App() {
  const d = useDrill();
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = d.theme ? d.theme === "dark" : prefersDark();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* keyboard: pick with 1-4 / a-d / T / F, Enter to confirm then advance */
  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = e.target.tagName === "INPUT" || e.target.tagName === "SELECT";

      if (e.key === "Enter") {
        e.preventDefault();
        if (!d.current) return;
        if (d.current.kind === "sa") {
          if (!d.revealed) d.setRevealed(true);
          return;
        }
        if (d.answered) d.next();
        else d.confirm();
        return;
      }
      if (typing || !d.current || d.answered) return;

      const { kind, item } = d.current;
      if (kind === "mcq") {
        const byNumber = "1234".indexOf(e.key);
        const byLetter = "abcd".indexOf(e.key.toLowerCase());
        const index = byNumber !== -1 ? byNumber : byLetter;
        if (index !== -1 && item.opts[index]) d.setPick(item.opts[index].k);
      } else if (kind === "tf") {
        if (e.key.toLowerCase() === "t") d.setPick(true);
        if (e.key.toLowerCase() === "f") d.setPick(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [d]);

  const finished = d.queue.length > 0 && d.cursor >= d.queue.length;

  return (
    <>
      {/* Psychological Blue Motion Blur Ambient Auras */}
      <div className="ambient-container" aria-hidden="true">
        <div className="aura-blob aura-blob-1" />
        <div className="aura-blob aura-blob-2" />
        <div className="aura-blob aura-blob-3" />
        <div className="aura-blob aura-blob-4" />
      </div>

      {/* Authentic Liquid Speckle & Grain Overlay */}
      <svg className="noise-overlay" aria-hidden="true">
        <filter id="speckle-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.08   0 0 0 0 0.18   0 0 0 0 0.65   0 0 0 0.18 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#speckle-noise)" />
      </svg>

      <div className={`scrim${menuOpen ? " open" : ""}`} onClick={closeMenu} />
      <div className="shell">
        <Rail
          open={menuOpen}
          onClose={closeMenu}
          courseKey={d.courseKey}
          courseCaption={d.course.caption}
          onCourse={d.changeCourse}
          counts={d.counts}
          topicNames={d.topicNames}
          mode={d.mode}
          onMode={d.setMode}
          topics={d.topics}
          onToggleTopic={d.toggleTopic}
          onAllTopics={() => d.setTopics([])}
          shuffleOn={d.shuffleOn}
          onShuffle={() => d.setShuffleOn(!d.shuffleOn)}
          dark={dark}
          onTheme={() => d.setTheme(dark ? "light" : "dark")}
          onRestart={d.restart}
          onClear={d.clearProgress}
        />

        <main className="main">
          <TopBar
            onMenu={() => setMenuOpen((v) => !v)}
            position={d.cursor + 1}
            total={d.queue.length}
            right={d.score.right}
            wrong={d.score.wrong}
            attempted={d.score.attempted}
          />

          <div className="wrap">
            {d.queue.length === 0 && (
              <div className="done">
                <h2>Nothing selected</h2>
                <p>Pick at least one module in the sidebar to start drilling.</p>
              </div>
            )}

            {finished && (
              <Summary
                score={d.score}
                topicNames={d.topicNames}
                hasWrong={d.hasWrong}
                onRetryWrong={d.retryWrong}
                onRestart={d.restart}
              />
            )}

            {d.current && (
              <div className="card">
                <div className="meta">
                  <span className="qid">
                    {PREFIX[d.current.kind]}{" "}
                    {String(d.current.item.id).padStart(d.current.kind === "mcq" ? 3 : 2, "0")}
                  </span>
                  <span className="tag">{d.topicNames[d.current.item.t]}</span>
                  {d.retryOnly !== null && <span className="tag retry">retry set</span>}
                </div>

                {d.current.kind === "mcq" && (
                  <McqCard
                    key={`${d.courseKey}-${d.current.item.id}`}
                    item={d.current.item}
                    answered={d.answered}
                    pick={d.pick}
                    onPick={d.setPick}
                    onConfirm={d.confirm}
                    onSkip={d.skip}
                    onNext={d.next}
                  />
                )}

                {d.current.kind === "tf" && (
                  <TfCard
                    key={`${d.courseKey}-${d.current.item.id}`}
                    item={d.current.item}
                    answered={d.answered}
                    pick={d.pick}
                    onPick={d.setPick}
                    onConfirm={d.confirm}
                    onSkip={d.skip}
                    onNext={d.next}
                  />
                )}

                {d.current.kind === "fitb" && (
                  <BlankCard
                    key={`${d.courseKey}-${d.current.item.id}`}
                    item={d.current.item}
                    answered={d.answered}
                    pick={d.pick}
                    typed={d.typed}
                    onType={d.setTyped}
                    onConfirm={d.confirm}
                    onSkip={d.skip}
                    onNext={d.next}
                    onOverride={d.overrideCorrect}
                  />
                )}

                {d.current.kind === "match" && (
                  <MatchCard
                    key={`${d.courseKey}-${d.current.item.id}`}
                    item={d.current.item}
                    answered={d.answered}
                    pairs={d.pairs}
                    onPair={(row, value) => d.setPairs((p) => ({ ...p, [row]: value }))}
                    onConfirm={d.confirm}
                    onSkip={d.skip}
                    onNext={d.next}
                  />
                )}

                {d.current.kind === "sa" && (
                  <ShortCard
                    key={`${d.courseKey}-${d.current.item.id}`}
                    item={d.current.item}
                    revealed={d.revealed}
                    onReveal={() => d.setRevealed(true)}
                    onSkip={d.skip}
                    onSelfMark={d.selfMark}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
