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
export function TokenDiff({ yours, correct, lang }) {
  const d = tokenDiff(yours, correct, lang);
  return (
    <div className="tdiff">
      <div className="trow">
        <span className="tlab">You wrote</span>
        <code className="tline">
          {d.yours.length
            ? d.yours.map((x, i) => <span key={i} className={x.ok ? "tk" : "tk bad"}>{x.t}</span>)
            : <span className="tk bad">(nothing)</span>}
        </code>
      </div>
      <div className="trow">
        <span className="tlab">Correct</span>
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
