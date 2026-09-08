import { useEffect, useRef } from "react";
import RichText from "./RichText.jsx";
import Feedback from "./Feedback.jsx";
import Actions, { Hint, Key } from "./Actions.jsx";

export default function BlankCard({
  item, answered, pick, typed, onType, onConfirm, onSkip, onNext, onOverride
}) {
  const input = useRef(null);
  const correct = pick === "ok";

  useEffect(() => {
    if (!answered && input.current) input.current.focus();
  }, [answered, item.id]);

  const segments = item.q.split("§");

  return (
    <>
      <p className="blankline">
        {segments.map((part, i) => (
          <span key={i}>
            <RichText>{part}</RichText>
            {i < segments.length - 1 && <span className="slot" aria-label="blank" />}
          </span>
        ))}
      </p>

      <input
        ref={input}
        className={`answerbox${answered ? (correct ? " is-ok" : " is-no") : ""}`}
        type="text"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder="Type your answer"
        value={typed}
        disabled={answered}
        onChange={(e) => onType(e.target.value)}
      />

      {answered ? (
        <>
          <Feedback tone={correct ? "ok" : "no"} verdict={correct ? "Correct" : "Answer"}>
            <span className="corr">{item.ans}</span>
            {!correct && <p>Marked wrong. If what you wrote means the same thing, count it.</p>}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            {!correct && (
              <button type="button" className="btn ghost" onClick={onOverride}>Count as correct</button>
            )}
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={onConfirm}>Check</button>
          <button type="button" className="btn ghost" onClick={onSkip}>Show answer</button>
          <Hint><Key>Enter</Key> to check</Hint>
        </Actions>
      )}
    </>
  );
}
