import { useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock } from "./CodeBits.jsx";
import { langGroup } from "../../lib/codeBank.js";
import { isBlank, isMeaningful, lineKey } from "../../lib/code.js";

/* one extra line was slipped into the file */
export default function IntruderCard({ item, files, bank, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [setup] = useState(() => {
    const own = new Set(file.lines.map((l) => lineKey(l, file.lang)));
    const group = langGroup(file.lang);
    const fromOthers = files
      .filter((f, i) => i !== item.f && langGroup(f.lang) === group)
      .flatMap((f) => f.lines.filter(isMeaningful).map((l) => l.trim()));
    const pool = [...bank.intruders[group], ...fromOthers].filter((l) => !own.has(lineKey(l, file.lang)));
    const text = pool[Math.floor(Math.random() * pool.length)];
    const at = 1 + Math.floor(Math.random() * file.lines.length); /* never above line 1 */
    const ref = file.lines[Math.min(at, file.lines.length - 1)] || "";
    const indent = isBlank(ref) ? (file.lines[at - 1].match(/^\s*/) || [""])[0] : (ref.match(/^\s*/) || [""])[0];
    const lines = [...file.lines.slice(0, at), indent + text, ...file.lines.slice(at)];
    return { lines, at };
  });
  const [pick, setPick] = useState(null);
  const ok = pick === setup.at;

  return (
    <>
      <p className="qtext small">One line in this <b>{file.name}</b> doesn't belong. Tap it.</p>
      <CodeBlock
        lines={setup.lines}
        lang={file.lang}
        row={(i, text) => {
          if (isBlank(text)) return null;
          let cls = pick === i ? "sel" : "";
          if (answered) cls = i === setup.at ? "no" : pick === i ? "picked-wrong" : "";
          return { className: cls, onClick: answered ? undefined : () => setPick(i) };
        }}
      />
      {answered ? (
        <>
          <Feedback tone={ok ? "ok" : "no"} verdict={ok ? "Caught it" : `The intruder is line ${setup.at + 1}`}>
            <p>Line numbers here include the intruder. Every other line is exactly as in your file.</p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={pick === null} onClick={() => onFinish(ok)}>Check</button>
          <button type="button" className="btn ghost" onClick={() => onFinish(false)}>Show it</button>
          <Hint>{pick === null ? "Tap a line" : `Line ${pick + 1} selected`}</Hint>
        </Actions>
      )}
    </>
  );
}
