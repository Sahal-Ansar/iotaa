import RichText from "./RichText.jsx";
import Actions, { Hint, Key } from "./Actions.jsx";

export default function ShortCard({ item, revealed, onReveal, onSkip, onSelfMark }) {
  return (
    <>
      <RichText as="p" className="qtext">{item.q}</RichText>

      {revealed ? (
        <div className="model">
          <div className="v">Model answer · {item.marks} marks</div>
          <RichText as="p">{item.a}</RichText>
          <div className="selfrow">
            <button type="button" className="btn" onClick={() => onSelfMark(true)}>I had that</button>
            <button type="button" className="btn ghost" onClick={() => onSelfMark(false)}>Needs review</button>
          </div>
        </div>
      ) : (
        <>
          <p className="prompt">
            Answer it in your head or on paper — {item.marks} marks — then reveal the model answer.
          </p>
          <Actions>
            <button type="button" className="btn" onClick={onReveal}>Reveal model answer</button>
            <button type="button" className="btn ghost" onClick={onSkip}>Skip</button>
            <Hint><Key>Enter</Key> to reveal</Hint>
          </Actions>
        </>
      )}
    </>
  );
}
