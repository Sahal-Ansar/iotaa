import { useEffect, useRef, useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl, inputProps } from "./CodeBits.jsx";
import { firstLetters, indentOf, isMeaningful, sameLine } from "../../lib/code.js";

export default function LettersCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const idx = [];
  for (let i = item.from; i <= item.to; i++) if (isMeaningful(file.lines[i])) idx.push(i);

  const [vals, setVals] = useState({});
  const [marks, setMarks] = useState(null);
  const refs = useRef({});

  useEffect(() => { refs.current[idx[0]]?.focus({ preventScroll: true }); }, []); // eslint-disable-line

  const check = () => {
    if (answered) return;
    const m = {};
    idx.forEach((i) => { m[i] = sameLine(vals[i] || "", file.lines[i], file.lang); });
    setMarks(m);
    onFinish(idx.every((i) => m[i]));
  };
  const reveal = () => {
    if (answered) return;
    const m = {};
    idx.forEach((i) => { m[i] = false; });
    setMarks(m);
    onFinish(false);
  };

  const right = marks ? idx.filter((i) => marks[i]).length : 0;

  return (
    <>
      <p className="qtext small">
        <b>{file.name}</b> — {item.label}. Each box shows only the first letter of every word. Type the full line.
      </p>

      <CodeBlock
        lines={file.lines.slice(item.from, item.to + 1)}
        lang={file.lang}
        from={item.from}
        row={(i, text) => {
          if (!isMeaningful(text)) return null;
          const k = idx.indexOf(i);
          const state = marks ? (marks[i] ? " ok" : " no") : "";
          return {
            className: state.trim(),
            content: (
              <span className="infield" style={{ paddingLeft: `${indentOf(text).length}ch` }}>
                <input
                  ref={(el) => { refs.current[i] = el; }}
                  className={`code-in wide${state}`}
                  {...inputProps}
                  placeholder={firstLetters(text.trim(), file.lang)}
                  value={vals[i] || ""}
                  disabled={answered}
                  onChange={(e) => setVals((v) => ({ ...v, [i]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.shiftKey || k === idx.length - 1) check();
                      else refs.current[idx[k + 1]]?.focus();
                    }
                  }}
                />
              </span>
            ),
            after: marks && !marks[i] ? (
              <div className="cl fixline">
                <span className="ln">✓</span>
                <span className="lc"><Hl text={text} lang={file.lang} /></span>
              </div>
            ) : null
          };
        }}
      />

      {answered ? (
        <>
          <Feedback tone={right === idx.length ? "ok" : "no"} verdict={`${right} / ${idx.length} lines exact`}>
            <p>{right === idx.length ? "All lines rebuilt from first letters." : "Corrections are shown in green under each missed line."}</p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={check}>Check</button>
          <button type="button" className="btn ghost" onClick={reveal}>Show lines</button>
          <Hint><Key>Enter</Key> next line · <Key>⇧ Enter</Key> check</Hint>
        </Actions>
      )}
    </>
  );
}
