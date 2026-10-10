import { useEffect } from "react";
import Summary from "../Summary.jsx";
import { CODE_MODES, CODE_PREFIX } from "../../lib/codeBank.js";
import StudyCard from "./StudyCard.jsx";
import LineCard from "./LineCard.jsx";
import ClozeCard from "./ClozeCard.jsx";
import BugCard from "./BugCard.jsx";
import OrderCard from "./OrderCard.jsx";
import LettersCard from "./LettersCard.jsx";
import ChainCard from "./ChainCard.jsx";
import WriteCard from "./WriteCard.jsx";
import QuizCard from "./QuizCard.jsx";
import RealFakeCard from "./RealFakeCard.jsx";
import PickLineCard from "./PickLineCard.jsx";
import WhichNoteCard from "./WhichNoteCard.jsx";
import ExplainCard from "./ExplainCard.jsx";
import FlashCard from "./FlashCard.jsx";
import UnscrambleCard from "./UnscrambleCard.jsx";
import GapCard from "./GapCard.jsx";
import SwapCard from "./SwapCard.jsx";
import IntruderCard from "./IntruderCard.jsx";
import TripleBugCard from "./TripleBugCard.jsx";
import { SURVIVAL_LIVES } from "../../lib/codeBank.js";

/* kind → [component, extra props] */
const CARDS = {
  study: [StudyCard],
  flash: [FlashCard],
  explain: [ExplainCard],
  real: [RealFakeCard],
  pick: [PickLineCard, { variant: "pick" }],
  next: [PickLineCard, { variant: "next" }],
  whichnote: [WhichNoteCard],
  quiz: [QuizCard],
  order: [OrderCard],
  unscramble: [UnscrambleCard],
  place: [GapCard, { variant: "place" }],
  swap: [SwapCard],
  line: [LineCard, { variant: "fill" }],
  finish: [LineCard, { variant: "finish" }],
  prev: [LineCard, { variant: "prev" }],
  cloze: [ClozeCard, { variant: "words" }],
  symbols: [ClozeCard, { variant: "symbols" }],
  letters: [LettersCard, { variant: "letters" }],
  imports: [LettersCard, { variant: "imports" }],
  chain: [ChainCard],
  bug: [BugCard],
  missing: [GapCard, { variant: "missing" }],
  intruder: [IntruderCard],
  triple: [TripleBugCard],
  write: [WriteCard],
  speed: [RealFakeCard, { timed: 8000 }]
};

/* rounds where showing the line number would give the answer away */
const HIDE_LINE = new Set(["place", "missing", "next", "prev"]);

function where(kind, item, files) {
  const name = files[item.t].name;
  if (item.n !== undefined && !HIDE_LINE.has(kind)) return `${name} · line ${item.n + 1}`;
  if (item.label) return `${name} · ${item.label}`;
  return name;
}

export default function CodeStage({ c }) {
  const files = c.bank.files;
  const finished = c.queue.length > 0 && c.cursor >= c.queue.length;
  const mode = CODE_MODES.find((m) => m.key === c.mode);

  /* Enter moves on once a card is answered (inputs handle their own Enter) */
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === "TEXTAREA" || (tag === "INPUT" && !e.target.disabled)) return;
      if (tag === "BUTTON") return; /* let the focused button do its thing */
      if (!c.current) return;
      if (c.current.kind === "study" || c.answered) {
        e.preventDefault();
        c.next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [c]);

  if (c.queue.length === 0) {
    return (
      <div className="done">
        <h2>Nothing selected</h2>
        <p>Pick at least one file in the sidebar.</p>
      </div>
    );
  }

  if (finished) {
    if (c.mode === "survival") {
      return (
        <div className="done">
          <div className="bignum">{c.streak}</div>
          <h2>{c.lives <= 0 ? "Out of lives" : "You cleared the whole deck"}</h2>
          <p>{c.streak} right before {c.lives <= 0 ? "the third miss" : "running out of cards"}. Best run: {c.best}.</p>
          <div className="acts center">
            <button type="button" className="btn" onClick={c.restart}>Go again</button>
            {c.hasWrong && <button type="button" className="btn ghost" onClick={c.retryWrong}>Drill the misses</button>}
          </div>
        </div>
      );
    }
    if (c.mode === "study") {
      return (
        <div className="done">
          <div className="bignum">✓</div>
          <h2>All files read</h2>
          <p>Now test it. Start with Line fill, then work down the list to Write from memory.</p>
          <div className="acts center">
            <button type="button" className="btn" onClick={() => c.setMode("line")}>Start Line fill</button>
            <button type="button" className="btn ghost" onClick={c.restart}>Read again</button>
          </div>
        </div>
      );
    }
    return (
      <Summary
        score={c.score}
        topicNames={c.topicNames}
        hasWrong={c.hasWrong}
        onRetryWrong={c.retryWrong}
        onRestart={c.restart}
      />
    );
  }

  const { kind, item } = c.current;
  const [Card, extra = {}] = CARDS[kind];

  return (
    <>
      {c.cursor === 0 && mode && <p className="roundblurb"><b>{mode.label}.</b> {mode.blurb}{c.mode === "survival" && c.best ? ` Best run: ${c.best}.` : ""}</p>}
      <div className="card codecard">
        <div className="meta">
          <span className="qid">{CODE_PREFIX[kind]}</span>
          <span className="tag">{where(kind, item, files)}</span>
          {c.retryOnly !== null && <span className="tag retry">retry set</span>}
          {c.mode === "survival" && (
            <span className="tag lives" aria-label={`${c.lives} lives left`}>
              {"♥".repeat(Math.max(0, c.lives))}{"♡".repeat(Math.max(0, SURVIVAL_LIVES - c.lives))} · {c.streak}
            </span>
          )}
        </div>
        <Card
          key={`${item.id}-${c.nonce}`}
          item={item}
          files={files}
          answered={c.answered}
          onFinish={c.finish}
          onNext={c.next}
          onOverride={c.override}
          level={c.level}
          onLevel={c.setLevel}
          isLast={c.cursor === c.queue.length - 1}
          {...extra}
        />
      </div>
    </>
  );
}
