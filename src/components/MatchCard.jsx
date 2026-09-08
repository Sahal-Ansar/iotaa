import RichText from "./RichText.jsx";
import Feedback from "./Feedback.jsx";
import Actions, { Hint, Key } from "./Actions.jsx";

export default function MatchCard({ item, answered, pairs, onPair, onConfirm, onSkip, onNext }) {
  const keys = item.right.map((r) => r.k);
  const matched = item.left.filter((row) => pairs[row.n] === item.ans[row.n]).length;
  const perfect = matched === item.left.length;

  return (
    <>
      <p className="qtext">Set {item.n} — {item.title}</p>

      <div className="mrows">
        {item.left.map((row) => {
          const chosen = pairs[row.n] || "";
          const right = chosen === item.ans[row.n];
          return (
            <div key={row.n} className={`mrow${answered ? (right ? " is-ok" : " is-no") : ""}`}>
              <span className="n">{row.n}</span>
              <span className="lt">
                <RichText>{row.t}</RichText>
                {answered && !right && <span className="mfix">→ {item.ans[row.n]}</span>}
              </span>
              <select
                value={chosen}
                disabled={answered}
                aria-label={`Match for ${row.n}`}
                onChange={(e) => onPair(row.n, e.target.value)}
              >
                <option value="">–</option>
                {keys.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mkey">
        {item.right.map((r) => (
          <div key={r.k}>
            <b>{r.k}</b>
            <RichText>{r.t}</RichText>
          </div>
        ))}
      </div>

      {answered ? (
        <>
          <Feedback tone={perfect ? "ok" : "no"} verdict={`${matched} of ${item.left.length} matched`}>
            <p>{perfect ? "Full set — move on." : "Corrected pairs are marked in red above."}</p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" onClick={onConfirm}>Check pairs</button>
          <button type="button" className="btn ghost" onClick={onSkip}>Skip</button>
        </Actions>
      )}
    </>
  );
}
