import RichText from "./RichText.jsx";
import Feedback, { Explanation } from "./Feedback.jsx";
import Actions, { Hint, Key } from "./Actions.jsx";

export default function TfCard({ item, answered, pick, onPick, onConfirm, onSkip, onNext }) {
  const correct = pick === item.ans;

  const choice = (value, label) => {
    const isAnswer = answered && value === item.ans;
    const isWrongPick = answered && value === pick && pick !== item.ans;
    return (
      <button
        key={label}
        type="button"
        className={`opt${isAnswer ? " is-ok" : ""}${isWrongPick ? " is-no" : ""}`}
        aria-pressed={pick === value}
        disabled={answered}
        onClick={() => onPick(value)}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <RichText as="p" className="qtext">{item.q}</RichText>
      <div className="tfrow">{choice(true, "True")}{choice(false, "False")}</div>

      {answered ? (
        <>
          <Feedback
            tone={correct ? "ok" : "no"}
            verdict={correct ? "Correct" : `Not quite — the statement is ${item.ans ? "TRUE" : "FALSE"}`}
          >
            <Explanation text={item.exp} />
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={pick === null} onClick={onConfirm}>Confirm</button>
          <button type="button" className="btn ghost" onClick={onSkip}>Skip</button>
          <Hint><Key>T</Key>/<Key>F</Key> pick · <Key>Enter</Key></Hint>
        </Actions>
      )}
    </>
  );
}
