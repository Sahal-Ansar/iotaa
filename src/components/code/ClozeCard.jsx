import { useEffect, useMemo, useRef, useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl, Seg, inputProps } from "./CodeBits.jsx";
import { highlight, isNumber, isWord, rng, shuffled } from "../../lib/code.js";

export const LEVELS = [
  { key: "easy", label: "Easy", ratio: 0.25 },
  { key: "medium", label: "Medium", ratio: 0.45 },
  { key: "hard", label: "Hard", ratio: 0.7 },
  { key: "all", label: "Every word", ratio: 1 }
];

const blankable = (t) => isWord(t) || isNumber(t) || /^["'`]/.test(t);
const symbolic = (t) => !blankable(t) && t !== ";" && t !== ",";
const unquote = (s) => s.trim().replace(/^["'`]|["'`]$/g, "");
const KEYWORDLESS = new Set(["const", "return", "export", "import", "from"]);

/* split each line into highlighted parts and decide which ones are blanks */
function buildBlanks(lines, lang, ratio, seed, symbols) {
  const rand = rng(seed);
  const parts = lines.map((line) => highlight(line, lang));
  const slots = [];
  parts.forEach((row, li) =>
    row.forEach((p, pi) => {
      if (p.cls && (symbols ? symbolic(p.text) : blankable(p.text))) slots.push({ li, pi, easy: KEYWORDLESS.has(p.text) });
    })
  );
  /* at easy levels prefer the meaningful words over boilerplate keywords */
  const pool = ratio < 1 ? shuffled(slots, rand).sort((a, b) => a.easy - b.easy) : slots;
  const count = Math.max(1, Math.round(slots.length * ratio));
  const chosen = new Set(pool.slice(0, count).map((s) => `${s.li}:${s.pi}`));
  const blanks = [];
  parts.forEach((row, li) =>
    row.forEach((p, pi) => {
      if (chosen.has(`${li}:${pi}`)) {
        p.blank = blanks.length;
        blanks.push(p.text);
      }
    })
  );
  return { parts, blanks };
}

export default function ClozeCard({ item, files, answered, onFinish, onNext, level, onLevel, variant = "words" }) {
  const symbols = variant === "symbols";
  const file = files[item.f];
  const lines = file.lines.slice(item.from, item.to + 1);
  const ratio = (LEVELS.find((l) => l.key === level) || LEVELS[1]).ratio;
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const { parts, blanks } = useMemo(
    () => buildBlanks(lines, file.lang, ratio, seed, symbols),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, ratio, seed]
  );
  const [vals, setVals] = useState({});
  const [marks, setMarks] = useState(null);
  const refs = useRef([]);

  useEffect(() => {
    setVals({});
    setMarks(null);
    refs.current[0]?.focus({ preventScroll: true });
  }, [parts]);

  const check = () => {
    if (answered) return;
    const m = blanks.map((ans, i) => (symbols ? (vals[i] || "").replace(/\s+/g, "") === ans : unquote(vals[i] || "") === unquote(ans)));
    setMarks(m);
    onFinish(m.every(Boolean));
  };
  const reveal = () => {
    if (answered) return;
    setMarks(blanks.map(() => false));
    onFinish(false);
  };

  const right = marks ? marks.filter(Boolean).length : 0;

  return (
    <>
      <div className="toolrow">
        <span className="qtext small inline">
          {symbols ? "Fill in the missing symbols" : "Fill every blank"} in <b>{file.name}</b> — {item.label}.
        </span>
        {!answered && (
          <Seg value={level} label="Difficulty" options={symbols ? LEVELS.map((l) => (l.key === "all" ? { ...l, label: "Every symbol" } : l)) : LEVELS} onChange={(k) => { onLevel(k); setSeed((s) => s + 1); }} />
        )}
      </div>

      <CodeBlock
        lines={lines}
        lang={file.lang}
        from={item.from}
        row={(i) => {
          const row = parts[i - item.from];
          if (!row.some((p) => p.blank !== undefined)) return null;
          return {
            content: row.map((p, k) => {
              if (p.blank === undefined) {
                return p.cls ? <span key={k} className={`t-${p.cls}`}>{p.text}</span> : p.text;
              }
              const b = p.blank;
              const state = marks ? (marks[b] ? " ok" : " no") : "";
              return (
                <span key={k} className="blankwrap">
                  <input
                    ref={(el) => { refs.current[b] = el; }}
                    className={`code-in${state}`}
                    style={{ width: `${Math.max(symbols ? 2 : 3, p.text.length) + 1.5}ch` }}
                    {...inputProps}
                    aria-label={`blank ${b + 1}`}
                    value={vals[b] || ""}
                    disabled={answered}
                    onChange={(e) => setVals((v) => ({ ...v, [b]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.shiftKey || b === blanks.length - 1) check();
                        else refs.current[b + 1]?.focus();
                      }
                    }}
                  />
                  {marks && !marks[b] && <span className="fix"><Hl text={p.text} lang={file.lang} /></span>}
                </span>
              );
            })
          };
        }}
      />

      {answered ? (
        <>
          <Feedback tone={right === blanks.length ? "ok" : "no"} verdict={`${right} / ${blanks.length} blanks right`}>
            <p>
              {right === blanks.length
                ? "Every blank correct. Try a harder level next time this comes round."
                : "The green text under each red blank is what belongs there. Read the lines once more before moving on."}
            </p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={check}>Check</button>
          <button type="button" className="btn ghost" onClick={reveal}>Show answers</button>
          <Hint><Key>Enter</Key> next blank · <Key>⇧ Enter</Key> check</Hint>
        </Actions>
      )}
    </>
  );
}
