import { useEffect, useRef, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl, TokenDiff } from "./CodeBits.jsx";

/* Real or fake — also the speed round when `timed` is set */
export default function RealFakeCard({ item, files, bank, answered, onFinish, onNext, timed = 0 }) {
  const file = files[item.f];
  const real = file.lines[item.n];
  const [fake] = useState(() => (Math.random() < 0.5 ? bank.distractors(item.f, item.n, 1)[0] || null : null));
  const shown = fake ? fake.text : real;
  const [said, setSaid] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [left, setLeft] = useState(timed);
  const started = useRef(Date.now());

  const answer = (isReal) => {
    if (answered) return;
    setSaid(isReal);
    onFinish(isReal === !fake);
  };

  useEffect(() => {
    if (!timed || answered) return undefined;
    const id = setInterval(() => {
      const remaining = Math.max(0, timed - (Date.now() - started.current));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        setTimeUp(true);
        onFinish(false);
      }
    }, 100);
    return () => clearInterval(id);
  }, [timed, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) {
      if (answered || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "r" || k === "arrowleft" || k === "1") { e.preventDefault(); answer(true); }
      if (k === "f" || k === "arrowright" || k === "2") { e.preventDefault(); answer(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const from = Math.max(0, item.n - 2);
  const to = Math.min(file.lines.length - 1, item.n + 2);
  const lines = file.lines.slice(from, to + 1).map((l, k) => (from + k === item.n ? shown : l));
  const right = said !== null && said === !fake;

  return (
    <>
      {timed > 0 && (
        <div className="timer" aria-hidden="true">
          <i style={{ width: `${(left / timed) * 100}%` }} className={left < timed * 0.3 ? "low" : ""} />
        </div>
      )}
      <p className="qtext small">
        Is the highlighted line <b>exactly</b> what's in <b>{file.name}</b>?
      </p>

      <CodeBlock
        lines={lines}
        lang={file.lang}
        from={from}
        row={(i) => (i === item.n ? { className: answered ? (right ? "ok" : "no") : "sel" } : { className: "dim" })}
      />

      {!answered && (
        <div className="rfrow">
          <button type="button" className="rfbtn real" onClick={() => answer(true)}>Real <span>R</span></button>
          <button type="button" className="rfbtn fake" onClick={() => answer(false)}>Fake <span>F</span></button>
        </div>
      )}

      {answered && (
        <>
          <Feedback
            tone={right ? "ok" : "no"}
            verdict={timeUp ? `Time's up — it was ${fake ? "fake" : "real"}` : right ? `Right — it's ${fake ? "fake" : "real"}` : `No — it's ${fake ? "fake" : "real"}`}
          >
            {fake ? (
              <>
                <TokenDiff yours={fake.text} correct={real} lang={file.lang} labels={["Shown", "Real line"]} />
                {fake.why && <RichText as="p">{fake.why}</RichText>}
              </>
            ) : (
              <code className="corr"><Hl text={real.trim()} lang={file.lang} /></code>
            )}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      )}
      {!answered && (
        <Actions>
          <Hint><Key>R</Key> real · <Key>F</Key> fake</Hint>
        </Actions>
      )}
    </>
  );
}
