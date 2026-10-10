import { useEffect, useMemo, useRef, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { GapCode, Hl, TokenDiff, inputProps } from "./CodeBits.jsx";
import { equivalentGaps, sameLine } from "../../lib/code.js";

/* variant "place": tap where the given line goes.
   variant "missing": the line vanished — find the gap, then type it. */
export default function GapCard({ item, files, answered, onFinish, onNext, onOverride, variant = "place" }) {
  const file = files[item.f];
  const target = file.lines[item.n];
  const rows = useMemo(() => file.lines.filter((_, i) => i !== item.n).map((text) => ({ text })), [file, item.n]);
  const good = useMemo(() => equivalentGaps(file.lines, item.n, file.lang), [file, item.n]);
  const [gap, setGap] = useState(null);
  const [typed, setTyped] = useState("");
  const [res, setRes] = useState(null);
  const input = useRef(null);

  useEffect(() => {
    if (variant === "missing" && gap !== null && !answered) input.current?.focus({ preventScroll: true });
  }, [gap, variant, answered]);

  const check = () => {
    if (answered || gap === null) return;
    const where = good.includes(gap);
    const what = variant === "place" ? true : sameLine(typed, target, file.lang);
    setRes({ where, what });
    onFinish(where && what);
  };

  const ok = res && res.where && res.what;

  return (
    <>
      <p className="qtext small">
        {variant === "place"
          ? <>Where does this line go in <b>{file.name}</b>? Tap the gap.</>
          : <>One line was deleted from <b>{file.name}</b> and the code closed up. Tap where it was, then type it.</>}
      </p>

      {variant === "place" && (
        <div className="placeline"><code><Hl text={target.trim()} lang={file.lang} /></code></div>
      )}

      <GapCode
        rows={rows}
        lang={file.lang}
        gap={gap}
        onGap={setGap}
        answered={answered}
        correctGaps={good}
        insertText={variant === "place" || answered ? target.trim() : null}
      />

      {variant === "missing" && gap !== null && !answered && (
        <div className="fixbox">
          <label htmlFor="missline">The missing line</label>
          <input
            id="missline"
            ref={input}
            className="answerbox mono"
            {...inputProps}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); check(); } }}
          />
        </div>
      )}

      {answered ? (
        <>
          <Feedback
            tone={ok ? "ok" : "no"}
            verdict={
              !res ? "Here's where it goes"
                : ok ? "Exactly right"
                : !res.where ? "Wrong spot — the green gap is where it goes"
                : "Right spot, line isn't exact"
            }
          >
            {variant === "missing" && res && res.where && !res.what && <TokenDiff yours={typed} correct={target} lang={file.lang} />}
            {file.notes[item.n] && <RichText as="p">{file.notes[item.n]}</RichText>}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            {variant === "missing" && res && res.where && !res.what && typed.trim() && (
              <button type="button" className="btn ghost" onClick={() => { setRes({ where: true, what: true }); onOverride(); }}>Count as correct</button>
            )}
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={gap === null} onClick={check}>Check</button>
          <button type="button" className="btn ghost" onClick={() => onFinish(false)}>Show answer</button>
          <Hint>{gap === null ? "Tap a gap between lines" : variant === "missing" ? <><Key>Enter</Key> to check</> : "Gap selected"}</Hint>
        </Actions>
      )}
    </>
  );
}
