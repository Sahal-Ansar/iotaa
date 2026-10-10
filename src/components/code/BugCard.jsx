import { useEffect, useRef, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl, TokenDiff, inputProps } from "./CodeBits.jsx";
import { sameLine } from "../../lib/code.js";

export default function BugCard({ item, files, answered, onFinish, onNext, onOverride }) {
  const file = files[item.f];
  const indent = (file.lines[item.line].match(/^\s*/) || [""])[0];
  const shown = file.lines.map((l, i) => (i === item.line ? indent + item.bad.trim() : l));
  const correct = file.lines[item.line];

  const [picked, setPicked] = useState(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState(null);
  const input = useRef(null);

  useEffect(() => {
    if (picked !== null && !answered) input.current?.focus({ preventScroll: true });
  }, [picked, answered]);

  const pick = (i) => {
    if (answered) return;
    setPicked(i);
    setTyped(shown[i].trim());
  };

  const check = () => {
    if (answered || picked === null) return;
    const foundLine = picked === item.line;
    const fixed = foundLine && sameLine(typed, correct, file.lang);
    setResult({ foundLine, fixed });
    onFinish(foundLine && fixed);
  };
  const reveal = () => {
    if (answered) return;
    setResult({ foundLine: false, fixed: false, gaveUp: true });
    onFinish(false);
  };

  const ok = result && result.foundLine && result.fixed;

  return (
    <>
      <p className="qtext small">
        One line in <b>{file.name}</b> has a bug. <b>Tap the broken line</b>, then correct it.
      </p>

      <CodeBlock
        lines={shown}
        lang={file.lang}
        row={(i, text) => {
          if (!text.trim()) return null;
          let cls = picked === i ? "sel" : "";
          if (answered) {
            if (i === item.line) cls = "no";
            else if (picked === i) cls = "picked-wrong";
          }
          const after = answered && i === item.line ? (
            <div className="cl fixline">
              <span className="ln">✓</span>
              <span className="lc"><Hl text={correct} lang={file.lang} /></span>
            </div>
          ) : null;
          return { className: cls, onClick: answered ? undefined : () => pick(i), after };
        }}
      />

      {picked !== null && !answered && (
        <div className="fixbox">
          <label htmlFor="fixline">Line {picked + 1} — rewrite it correctly</label>
          <input
            id="fixline"
            ref={input}
            className="answerbox mono"
            {...inputProps}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); check(); }
            }}
          />
        </div>
      )}

      {answered ? (
        <>
          <Feedback
            tone={ok ? "ok" : "no"}
            verdict={
              ok ? "Found and fixed"
                : result.gaveUp ? `The bug is on line ${item.line + 1}`
                : !result.foundLine ? `Wrong line — the bug is on line ${item.line + 1}`
                : "Right line, fix isn't exact"
            }
          >
            <RichText as="p">{item.why}</RichText>
            {result.foundLine && !result.fixed && <TokenDiff yours={typed} correct={correct} lang={file.lang} />}
            {(!result.foundLine || ok) && <code className="corr">{correct.trim()}</code>}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            {result.foundLine && !result.fixed && (
              <button type="button" className="btn ghost" onClick={() => { setResult({ foundLine: true, fixed: true }); onOverride(); }}>
                Count as correct
              </button>
            )}
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={picked === null} onClick={check}>Check fix</button>
          <button type="button" className="btn ghost" onClick={reveal}>Show bug</button>
          <Hint>{picked === null ? "Tap a line" : <><Key>Enter</Key> to check</>}</Hint>
        </Actions>
      )}
    </>
  );
}
