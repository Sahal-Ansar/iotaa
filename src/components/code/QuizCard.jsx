import { useEffect, useState } from "react";
import RichText from "../RichText.jsx";
import Feedback, { Explanation } from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";

export default function QuizCard({ item, answered, onFinish, onNext }) {
  const [pick, setPick] = useState(null);
  const correct = pick === item.ans;

  const confirm = (k = pick) => {
    if (answered || !k) return;
    setPick(k);
    onFinish(k === item.ans);
  };
  const skip = () => {
    if (answered) return;
    onFinish(false);
  };

  useEffect(() => {
    function onKey(e) {
      if (answered || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && pick) { e.preventDefault(); e.stopPropagation(); confirm(); return; }
      const n = "123456".indexOf(e.key);
      const l = "abcdef".indexOf(e.key.toLowerCase());
      const i = n !== -1 ? n : l;
      if (i !== -1 && item.opts[i]) setPick(item.opts[i].k);
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

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
              onClick={() => setPick(opt.k)}
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
          <Feedback tone={correct ? "ok" : "no"} verdict={correct ? "Correct" : `Answer is (${item.ans})`}>
            <Explanation text={item.exp} />
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={!pick} onClick={() => confirm()}>Confirm</button>
          <button type="button" className="btn ghost" onClick={skip}>Skip</button>
          <Hint><Key>1</Key>–<Key>{item.opts.length}</Key> pick · <Key>Enter</Key></Hint>
        </Actions>
      )}
    </>
  );
}
