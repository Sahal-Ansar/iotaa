import { useEffect, useRef, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, TokenDiff, inputProps } from "./CodeBits.jsx";
import { indentOf, sameLine, splitParts } from "../../lib/code.js";
import { Hl } from "./CodeBits.jsx";

const CONTEXT = 7;

/* variant "fill": line missing in context · "finish": first half given ·
   "prev": only the lines below are shown — recall backwards */
function prefixOf(line, lang) {
  const parts = splitParts(line.trim(), lang);
  const total = parts.filter((p) => p.tok).length;
  const want = Math.max(1, Math.floor(total / 2));
  let seen = 0;
  let out = "";
  for (const p of parts) {
    if (p.tok) { if (seen === want) break; seen++; }
    out += p.text;
  }
  return out;
}

export default function LineCard({ item, files, answered, onFinish, onNext, onOverride, variant = "fill" }) {
  const file = files[item.f];
  const target = file.lines[item.n];
  const prefix = variant === "finish" ? prefixOf(target, file.lang) : "";
  const [typed, setTyped] = useState("");
  const [ok, setOk] = useState(null);
  const input = useRef(null);

  useEffect(() => { input.current?.focus({ preventScroll: true }); }, []);

  const from = variant === "prev" ? item.n : Math.max(0, item.n - CONTEXT);
  const to = variant === "finish" ? item.n : Math.min(file.lines.length - 1, item.n + CONTEXT);
  const full = prefix ? `${prefix} ${typed}` : typed;

  const check = () => {
    if (answered) return;
    const good = sameLine(full, target, file.lang);
    setOk(good);
    onFinish(good);
  };
  const reveal = () => {
    if (answered) return;
    setOk(false);
    onFinish(false);
  };

  return (
    <>
      <p className="qtext small">
        {variant === "finish" && <>Finish line <b>{item.n + 1}</b> of <b>{file.name}</b>.</>}
        {variant === "prev" && <>Recall backwards: type the line that comes <b>above</b> these in <b>{file.name}</b>.</>}
        {variant === "fill" && <>Type the missing line <b>{item.n + 1}</b> of <b>{file.name}</b>. Spacing doesn't matter; the words and symbols do.</>}
      </p>

      <CodeBlock
        lines={file.lines.slice(from, to + 1)}
        lang={file.lang}
        from={from}
        row={(i) =>
          i === item.n
            ? {
                className: `target${answered ? (ok ? " ok" : " no") : ""}`,
                content: (
                  <span className="infield" style={{ paddingLeft: `${indentOf(target).length}ch` }}>
                    {prefix && <span className="prefix"><Hl text={prefix} lang={file.lang} /></span>}
                    <input
                      ref={input}
                      className="code-in wide"
                      {...inputProps}
                      value={typed}
                      disabled={answered}
                      placeholder={variant === "finish" ? "…finish it" : "type this line"}
                      onChange={(e) => setTyped(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); check(); }
                      }}
                    />
                  </span>
                )
              }
            : null
        }
      />

      {answered ? (
        <>
          <Feedback tone={ok ? "ok" : "no"} verdict={ok ? "Exact" : "Not quite"}>
            {!ok && <TokenDiff yours={full} correct={target} lang={file.lang} />}
            {ok && <code className="corr">{target.trim()}</code>}
            {file.notes[item.n] && <RichText as="p">{file.notes[item.n]}</RichText>}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            {!ok && typed.trim() && (
              <button type="button" className="btn ghost" onClick={() => { setOk(true); onOverride(); }}>
                Count as correct
              </button>
            )}
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={check}>Check</button>
          <button type="button" className="btn ghost" onClick={reveal}>Show line</button>
          <Hint><Key>Enter</Key> to check</Hint>
        </Actions>
      )}
    </>
  );
}
