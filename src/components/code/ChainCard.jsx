import { useEffect, useRef, useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { Hl, inputProps } from "./CodeBits.jsx";
import { firstLetters, indentOf, isBlank, sameLine, tokenDiff } from "../../lib/code.js";

/* Type the whole file one line at a time; misses are shown and you keep going. */
export default function ChainCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const steps = file.lines.map((t, i) => ({ t, i })).filter((x) => !isBlank(x.t));

  const [pos, setPos] = useState(0);
  const [log, setLog] = useState([]); /* { i, ok, typed } */
  const [typed, setTyped] = useState("");
  const [hint, setHint] = useState(false);
  const input = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    if (!answered) input.current?.focus({ preventScroll: true });
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [pos, answered]);

  const done = pos >= steps.length;

  const submit = () => {
    if (answered || done) return;
    const step = steps[pos];
    const ok = !hint && sameLine(typed, step.t, file.lang);
    const nextLog = [...log, { i: step.i, ok, typed }];
    setLog(nextLog);
    setTyped("");
    setHint(false);
    setPos(pos + 1);
    if (pos + 1 >= steps.length) onFinish(nextLog.every((x) => x.ok));
  };

  const giveUp = () => {
    if (answered) return;
    const rest = steps.slice(pos).map((s) => ({ i: s.i, ok: false, typed: "" }));
    const nextLog = [...log, ...rest];
    setLog(nextLog);
    setPos(steps.length);
    onFinish(false);
  };

  const right = log.filter((x) => x.ok).length;
  const byLine = Object.fromEntries(log.map((x) => [x.i, x]));
  const current = steps[pos];

  return (
    <>
      <p className="qtext small">
        Type <b>{file.name}</b> from the top, one line per <b>Enter</b>. A wrong line is corrected and you carry on.
      </p>

      <div className="code chain">
        {file.lines.map((text, i) => {
          if (current && i >= current.i) return null;
          if (isBlank(text)) return <div key={i} className="cl"><span className="ln">{i + 1}</span><span className="lc"> </span></div>;
          const entry = byLine[i];
          if (!entry) return null;
          return (
            <div key={i} className="clwrap">
              <div className={`cl ${entry.ok ? "ok" : "no"}`}>
                <span className="ln">{i + 1}</span>
                <span className="lc"><Hl text={text} lang={file.lang} /></span>
              </div>
              {!entry.ok && entry.typed && (
                <div className="cl yours">
                  <span className="ln">✗</span>
                  <span className="lc">
                    {indentOf(text)}
                    {tokenDiff(entry.typed, text, file.lang).yours.map((x, k) => (
                      <span key={k}>{k ? " " : ""}<span className={x.ok ? "tk" : "tk bad"}>{x.t}</span></span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        {current && !answered && (
          <div className="cl target">
            <span className="ln">{current.i + 1}</span>
            <span className="lc">
              <span className="infield" style={{ paddingLeft: `${indentOf(current.t).length}ch` }}>
                <input
                  ref={input}
                  className="code-in wide"
                  {...inputProps}
                  value={typed}
                  placeholder={hint ? firstLetters(current.t.trim(), file.lang) : "next line…"}
                  onChange={(e) => setTyped(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); submit(); }
                  }}
                />
              </span>
            </span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      {!done && (
        <div className="chainstat">
          Line {pos + 1} of {steps.length} · {right} right so far
        </div>
      )}

      {answered ? (
        <>
          <Feedback tone={right === steps.length ? "ok" : "no"} verdict={`${right} / ${steps.length} lines right`}>
            <p>
              {right === steps.length
                ? "Perfect run — the whole file from memory."
                : "Red lines are the ones to drill. Use Retry missed at the end of the set, or Line fill for this file."}
            </p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={submit}>Enter line</button>
          <button type="button" className="btn ghost" disabled={hint} onClick={() => { setHint(true); input.current?.focus(); }}>
            Hint (counts as miss)
          </button>
          <button type="button" className="btn ghost" onClick={giveUp}>Show the rest</button>
        </Actions>
      )}
    </>
  );
}
