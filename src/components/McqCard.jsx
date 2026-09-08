import RichText from "./RichText.jsx";
import Feedback, { Explanation } from "./Feedback.jsx";
import Actions, { Hint, Key } from "./Actions.jsx";

export default function McqCard({ item, answered, pick, onPick, onConfirm, onSkip, onNext }) {
  const correct = pick === item.ans;

  return (
    <>
      <RichText as="p" className="qtext">{item.q}</RichText>

      <div className="opts">
        {item.opts.map((opt) => {
          const isAnswer = answered && opt.k === item.ans;
          const isWrongPick = answered && opt.k === pick && pick !== item.ans;
          return (
            <button
              key={opt.k}
              type="button"
              className={`opt${isAnswer ? " is-ok" : ""}${isWrongPick ? " is-no" : ""}`}
              aria-pressed={pick === opt.k}
              disabled={answered}
              onClick={() => onPick(opt.k)}
            >
              <span className="k">{opt.k}</span>
              <RichText>{opt.t}</RichText>
              {isAnswer && <span className="mark">CORRECT</span>}
              {isWrongPick && <span className="mark">YOUR PICK</span>}
            </button>
          );
        })}
      </div>

      {answered ? (
        <>
          <Feedback
            tone={correct ? "ok" : "no"}
            verdict={correct ? "Correct" : `Not quite — answer is (${item.ans})`}
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
          <button type="button" className="btn" disabled={!pick} onClick={onConfirm}>Confirm</button>
          <button type="button" className="btn ghost" onClick={onSkip}>Skip</button>
          <Hint><Key>1</Key>–<Key>4</Key> pick · <Key>Enter</Key></Hint>
        </Actions>
      )}
    </>
  );
}
