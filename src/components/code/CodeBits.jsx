import { useEffect } from "react";
import RichText from "../RichText.jsx";
import { highlight, tokenDiff } from "../../lib/code.js";

/* one syntax-highlighted line */
export function Hl({ text, lang }) {
  return highlight(text, lang).map((p, i) =>
    p.cls ? <span key={i} className={`t-${p.cls}`}>{p.text}</span> : p.text
  );
}

/*
 * A numbered code block. `from` is the index of the first line shown, so
 * line numbers match the real file. `row(i)` may return extra props for a
 * row ({ className, onClick, content, after }).
 */
export function CodeBlock({ lines, lang, from = 0, row }) {
  return (
    <div className="code" role="group">
      {lines.map((text, k) => {
        const i = from + k;
        const extra = row ? row(i, text) || {} : {};
        const { className = "", onClick, content, after, title } = extra;
        return (
          <div key={i} className="clwrap">
            <div
              className={`cl${onClick ? " click" : ""}${className ? ` ${className}` : ""}`}
              onClick={onClick}
              title={title}
              role={onClick ? "button" : undefined}
              tabIndex={onClick ? 0 : undefined}
              onKeyDown={onClick ? (e) => { if (e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
            >
              <span className="ln">{i + 1}</span>
              <span className="lc">{content !== undefined ? content : (text ? <Hl text={text} lang={lang} /> : " ")}</span>
            </div>
            {after}
          </div>
        );
      })}
    </div>
  );
}

/* "You wrote" vs "Correct" with the differing tokens marked */
export function TokenDiff({ yours, correct, lang, labels = ["You wrote", "Correct"] }) {
  const d = tokenDiff(yours, correct, lang);
  return (
    <div className="tdiff">
      <div className="trow">
        <span className="tlab">{labels[0]}</span>
        <code className="tline">
          {d.yours.length
            ? d.yours.map((x, i) => <span key={i} className={x.ok ? "tk" : "tk bad"}>{x.t}</span>)
            : <span className="tk bad">(nothing)</span>}
        </code>
      </div>
      <div className="trow">
        <span className="tlab">{labels[1]}</span>
        <code className="tline">
          {d.correct.map((x, i) => <span key={i} className={x.ok ? "tk" : "tk miss"}>{x.t}</span>)}
        </code>
      </div>
    </div>
  );
}

export function Seg({ value, options, onChange, label }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const inputProps = {
  autoComplete: "off",
  autoCapitalize: "off",
  autoCorrect: "off",
  spellCheck: false
};

/* number keys pick, Enter confirms — shared by every multiple-choice round */
export function useChoiceKeys({ count, answered, pick, onPick, onConfirm }) {
  useEffect(() => {
    function onKey(e) {
      if (answered || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Enter" && pick !== null && pick !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
        return;
      }
      const i = "123456789".indexOf(e.key);
      if (i !== -1 && i < count) onPick(i);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });
}

/* options rendered as code lines or prose */
export function OptionList({ options, pick, answer, answered, onPick, code = true, lang }) {
  return (
    <div className="opts">
      {options.map((opt, i) => {
        const isAnswer = answered && i === answer;
        const isWrongPick = answered && i === pick && pick !== answer;
        return (
          <button
            key={i}
            type="button"
            className={`opt${code ? " codeopt" : ""}${isAnswer ? " is-ok" : ""}${isWrongPick ? " is-no" : ""}`}
            aria-pressed={pick === i}
            disabled={answered}
            onClick={() => onPick(i)}
          >
            <span className="k">{i + 1}</span>
            {code ? <code className="optcode"><Hl text={opt.trim()} lang={lang} /></code> : <RichText>{opt}</RichText>}
            {isAnswer && <span className="mark">CORRECT</span>}
            {isWrongPick && <span className="mark">YOUR PICK</span>}
          </button>
        );
      })}
    </div>
  );
}

/*
 * Lines with tappable gaps between them. `lines` are display rows
 * ({ text }), gap g sits before row g (g === rows.length is the end).
 */
export function GapCode({ rows, lang, gap, onGap, answered, correctGaps, insertText, numbered = true }) {
  const shownRight = answered ? (correctGaps.includes(gap) ? gap : correctGaps[0]) : null;
  const gapEl = (g) => {
    const isPick = gap === g;
    const isRight = g === shownRight;
    const cls = `gap${isPick ? " on" : ""}${answered && isPick && !isRight ? " no" : ""}${isRight ? " ok" : ""}`;
    return (
      <button key={`g${g}`} type="button" className={cls} disabled={answered} onClick={() => onGap(g)} aria-label={`insert at position ${g + 1}`}>
        {(isPick || isRight) && insertText ? <span className="gaptext"><Hl text={insertText} lang={lang} /></span> : <span className="gapline" />}
      </button>
    );
  };
  return (
    <div className="code gapcode">
      {rows.map((r, i) => (
        <div key={i} className="clwrap">
          {gapEl(i)}
          <div className={`cl${r.className ? ` ${r.className}` : ""}`}>
            <span className="ln">{numbered ? i + 1 : ""}</span>
            <span className="lc">{r.text ? <Hl text={r.text} lang={lang} /> : " "}</span>
          </div>
        </div>
      ))}
      {gapEl(rows.length)}
    </div>
  );
}
