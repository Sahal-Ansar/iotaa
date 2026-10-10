import { useEffect, useRef, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl, TokenDiff, inputProps } from "./CodeBits.jsx";
import { isMeaningful, sameLine } from "../../lib/code.js";

/* explanation → type the line it describes */
export default function ExplainCard({ item, files, answered, onFinish, onNext, onOverride }) {
  const file = files[item.f];
  const target = file.lines[item.n];
  const [typed, setTyped] = useState("");
  const [ok, setOk] = useState(null);
  const [context, setContext] = useState(false);
  const input = useRef(null);
  useEffect(() => { input.current?.focus({ preventScroll: true }); }, []);

  let above = item.n - 1;
  while (above >= 0 && !isMeaningful(file.lines[above])) above--;

  const check = () => {
    if (answered) return;
    const good = sameLine(typed, target, file.lang);
    setOk(good);
    onFinish(good);
  };

  return (
    <>
      <p className="qtext small">Which line of <b>{file.name}</b> is this describing? Type it.</p>
      <RichText as="div" className="notecard">{file.notes[item.n]}</RichText>

      {context && above >= 0 && (
        <CodeBlock lines={[file.lines[above]]} lang={file.lang} from={above} row={() => ({ className: "dim" })} />
      )}

      <input
        ref={input}
        className={`answerbox mono${answered ? (ok ? " is-ok" : " is-no") : ""}`}
        {...inputProps}
        placeholder="type the line"
        value={typed}
        disabled={answered}
        onChange={(e) => setTyped(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); check(); } }}
      />

      {answered ? (
        <>
          <Feedback tone={ok ? "ok" : "no"} verdict={ok ? `Exact — line ${item.n + 1}` : `It's line ${item.n + 1}`}>
            {ok ? <code className="corr"><Hl text={target.trim()} lang={file.lang} /></code>
              : <TokenDiff yours={typed} correct={target} lang={file.lang} />}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            {!ok && typed.trim() && (
              <button type="button" className="btn ghost" onClick={() => { setOk(true); onOverride(); }}>Count as correct</button>
            )}
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={check}>Check</button>
          {above >= 0 && !context && (
            <button type="button" className="btn ghost" onClick={() => { setContext(true); input.current?.focus(); }}>Show line above</button>
          )}
          <button type="button" className="btn ghost" onClick={() => { setOk(false); onFinish(false); }}>Show line</button>
          <Hint><Key>Enter</Key> to check</Hint>
        </Actions>
      )}
    </>
  );
}
