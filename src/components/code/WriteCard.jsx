import { useEffect, useRef, useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, inputProps } from "./CodeBits.jsx";
import { fileDiff } from "../../lib/code.js";

export default function WriteCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [text, setText] = useState("");
  const [diff, setDiff] = useState(null);
  const box = useRef(null);

  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);

  const check = () => {
    if (answered) return;
    const d = fileDiff(text, file.lines, file.lang);
    setDiff(d);
    onFinish(d.matched === d.total && d.extra.length === 0);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      check();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const el = e.target;
      const { selectionStart: a, selectionEnd: b } = el;
      const v = text.slice(0, a) + "  " + text.slice(b);
      setText(v);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = a + 2; });
    }
  };

  const pct = diff ? Math.round((diff.matched / diff.total) * 100) : 0;
  const perfect = diff && diff.matched === diff.total && diff.extra.length === 0;

  return (
    <>
      <p className="qtext small">
        Write all of <b>{file.name}</b> from memory ({file.lines.filter((l) => l.trim()).length} lines). Spacing and blank lines don't matter.
      </p>

      {!answered && (
        <textarea
          ref={box}
          className="wbox"
          {...inputProps}
          rows={Math.min(22, Math.max(6, file.lines.length + 2))}
          value={text}
          placeholder={`// ${file.name}`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
        />
      )}

      {answered && diff && (
        <>
          <Feedback tone={perfect ? "ok" : "no"} verdict={`${diff.matched} / ${diff.total} lines · ${pct}%`}>
            <p>
              {perfect
                ? "Word-perfect file."
                : "Green lines you wrote correctly and in order. Red lines were missing or wrong."}
            </p>
          </Feedback>
          <CodeBlock
            lines={file.lines}
            lang={file.lang}
            row={(i) => (diff.lineOk[i] === null ? null : { className: diff.lineOk[i] ? "ok" : "no" })}
          />
          {diff.extra.length > 0 && (
            <div className="extras">
              <div className="tlab">Lines you wrote that don't match anything</div>
              {diff.extra.map((l, i) => <code key={i}>{l}</code>)}
            </div>
          )}
        </>
      )}

      {answered ? (
        <Actions>
          <button type="button" className="btn" onClick={onNext}>Next</button>
          <Hint><Key>Enter</Key> to continue</Hint>
        </Actions>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={check}>Check file</button>
          <Hint><Key>Ctrl</Key>+<Key>Enter</Key> check · <Key>Tab</Key> indents</Hint>
        </Actions>
      )}
    </>
  );
}
