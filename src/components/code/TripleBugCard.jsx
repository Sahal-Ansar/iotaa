import { useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint } from "../Actions.jsx";
import { CodeBlock, Hl, inputProps } from "./CodeBits.jsx";
import { indentOf, isBlank, sameLine, shuffled } from "../../lib/code.js";

/* three broken lines in one file: tap each, fix it in place */
export default function TripleBugCard({ item, files, bank, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [bugs] = useState(() => {
    const byLine = {};
    shuffled(bank.bugs.filter((b) => b.f === item.f)).forEach((b) => { if (!byLine[b.line]) byLine[b.line] = b; });
    return shuffled(Object.values(byLine)).slice(0, 3).sort((a, b) => a.line - b.line);
  });
  const badAt = Object.fromEntries(bugs.map((b) => [b.line, b]));
  const shown = file.lines.map((l, i) => (badAt[i] ? indentOf(l) + badAt[i].bad.trim() : l));

  const [sel, setSel] = useState({}); /* line → typed fix */
  const [res, setRes] = useState(null);

  const toggle = (i) => {
    if (answered) return;
    setSel((s) => {
      const c = { ...s };
      if (i in c) delete c[i];
      else if (Object.keys(c).length < 3) c[i] = shown[i].trim();
      return c;
    });
  };

  const check = () => {
    if (answered) return;
    const r = bugs.map((b) => ({
      b,
      found: b.line in sel,
      fixed: b.line in sel && sameLine(sel[b.line], file.lines[b.line], file.lang)
    }));
    const wrongPicks = Object.keys(sel).map(Number).filter((i) => !badAt[i]);
    setRes({ r, wrongPicks });
    onFinish(r.every((x) => x.fixed));
  };
  const found = res ? res.r.filter((x) => x.found).length : 0;
  const fixed = res ? res.r.filter((x) => x.fixed).length : 0;

  return (
    <>
      <p className="qtext small">
        <b>Three</b> lines in <b>{file.name}</b> are broken. Tap each one and correct it where it stands.
      </p>
      <CodeBlock
        lines={shown}
        lang={file.lang}
        row={(i, text) => {
          if (isBlank(text)) return null;
          const editing = i in sel && !answered;
          let cls = i in sel ? "sel" : "";
          if (answered) cls = badAt[i] ? (res?.r.find((x) => x.b.line === i)?.fixed ? "ok" : "no") : i in sel ? "picked-wrong" : "";
          return {
            className: cls,
            onClick: answered || editing ? undefined : () => toggle(i),
            content: editing ? (
              <span className="infield" style={{ paddingLeft: `${indentOf(file.lines[i]).length}ch` }}>
                <input
                  className="code-in wide"
                  {...inputProps}
                  value={sel[i]}
                  autoFocus
                  onChange={(e) => setSel((s) => ({ ...s, [i]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
                    if (e.key === "Escape") toggle(i);
                  }}
                />
              </span>
            ) : undefined,
            after: answered && badAt[i] ? (
              <div className="cl fixline">
                <span className="ln">✓</span>
                <span className="lc"><Hl text={file.lines[i]} lang={file.lang} /></span>
              </div>
            ) : null
          };
        }}
      />
      {answered && res ? (
        <>
          <Feedback tone={fixed === 3 ? "ok" : "no"} verdict={`Found ${found}/3 · fixed ${fixed}/3`}>
            {res.r.map(({ b }) => (
              <RichText as="p" key={b.line}>{`<b>Line ${b.line + 1}:</b> ${b.why}`}</RichText>
            ))}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
          </Actions>
        </>
      ) : answered ? (
        <Actions><button type="button" className="btn" onClick={onNext}>Next</button></Actions>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={!Object.keys(sel).length} onClick={check}>Check all</button>
          <button type="button" className="btn ghost" onClick={() => { setRes({ r: bugs.map((b) => ({ b, found: false, fixed: false })), wrongPicks: [] }); onFinish(false); }}>Show bugs</button>
          <Hint>{Object.keys(sel).length}/3 lines picked · Esc un-picks</Hint>
        </Actions>
      )}
    </>
  );
}
