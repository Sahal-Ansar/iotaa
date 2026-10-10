import { useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock } from "./CodeBits.jsx";
import { isBlank, lineKey } from "../../lib/code.js";

/* two lines of the chunk trade places — tap both */
export default function SwapCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [pair] = useState(() => {
    const idx = [];
    for (let i = item.from; i <= item.to; i++) if (!isBlank(file.lines[i])) idx.push(i);
    for (let tries = 0; tries < 50; tries++) {
      const a = idx[Math.floor(Math.random() * idx.length)];
      const near = idx.filter((b) => b !== a && Math.abs(b - a) <= 4);
      const b = near[Math.floor(Math.random() * near.length)];
      if (b !== undefined && lineKey(file.lines[a], file.lang) !== lineKey(file.lines[b], file.lang)) return [Math.min(a, b), Math.max(a, b)];
    }
    return [idx[0], idx[1]];
  });
  const shown = file.lines.slice(item.from, item.to + 1).map((l, k) => {
    const i = item.from + k;
    if (i === pair[0]) return file.lines[pair[1]];
    if (i === pair[1]) return file.lines[pair[0]];
    return l;
  });
  const [sel, setSel] = useState([]);

  const toggle = (i) => {
    if (answered) return;
    setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length < 2 ? [...s, i] : [s[1], i]));
  };
  const ok = sel.length === 2 && sel.includes(pair[0]) && sel.includes(pair[1]);
  const check = () => { if (!answered && sel.length === 2) onFinish(ok); };

  return (
    <>
      <p className="qtext small">
        In <b>{file.name}</b> — {item.label} — two lines have swapped places. Tap both.
      </p>
      <CodeBlock
        lines={shown}
        lang={file.lang}
        from={item.from}
        row={(i, text) => {
          if (isBlank(text)) return null;
          let cls = sel.includes(i) ? "sel" : "";
          if (answered) cls = pair.includes(i) ? (sel.includes(i) ? "ok" : "no") : sel.includes(i) ? "picked-wrong" : "";
          return { className: cls, onClick: answered ? undefined : () => toggle(i) };
        }}
      />
      {answered ? (
        <>
          <Feedback tone={ok ? "ok" : "no"} verdict={ok ? "Found the swap" : `Lines ${pair[0] + 1} and ${pair[1] + 1} were swapped`}>
            <CodeBlock
              lines={file.lines.slice(item.from, item.to + 1)}
              lang={file.lang}
              from={item.from}
              row={(i) => (pair.includes(i) ? { className: "ok" } : null)}
            />
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={sel.length !== 2} onClick={check}>Check</button>
          <button type="button" className="btn ghost" onClick={() => onFinish(false)}>Show answer</button>
          <Hint>{sel.length}/2 selected</Hint>
        </Actions>
      )}
    </>
  );
}
