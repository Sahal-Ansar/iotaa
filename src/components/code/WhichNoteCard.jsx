import { useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, OptionList, useChoiceKeys } from "./CodeBits.jsx";
import { shuffled } from "../../lib/code.js";

/* line → which explanation belongs to it */
export default function WhichNoteCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [opts] = useState(() => {
    const note = file.notes[item.n];
    const others = shuffled(file.notes.filter((t, i) => t && i !== item.n && t !== note)).slice(0, 3);
    return shuffled([{ text: note, right: true }, ...others.map((text) => ({ text }))]);
  });
  const answer = opts.findIndex((o) => o.right);
  const [pick, setPick] = useState(null);
  const confirm = () => { if (!answered && pick !== null) onFinish(pick === answer); };
  useChoiceKeys({ count: opts.length, answered, pick, onPick: setPick, onConfirm: confirm });

  const from = Math.max(0, item.n - 2);
  const to = Math.min(file.lines.length - 1, item.n + 2);

  return (
    <>
      <p className="qtext small">What does the highlighted line in <b>{file.name}</b> do?</p>
      <CodeBlock
        lines={file.lines.slice(from, to + 1)}
        lang={file.lang}
        from={from}
        row={(i) => (i === item.n ? { className: "sel" } : { className: "dim" })}
      />
      <OptionList code={false} options={opts.map((o) => o.text)} pick={pick} answer={answer} answered={answered} onPick={setPick} />
      {answered ? (
        <>
          <Feedback tone={pick === answer ? "ok" : "no"} verdict={pick === answer ? "Correct" : `Answer is ${answer + 1}`}>
            <p>The other options describe other lines of {file.name} — knowing which is which is half of knowing the file.</p>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={pick === null} onClick={confirm}>Confirm</button>
          <button type="button" className="btn ghost" onClick={() => onFinish(false)}>Skip</button>
          <Hint><Key>1</Key>–<Key>{opts.length}</Key> pick · <Key>Enter</Key></Hint>
        </Actions>
      )}
    </>
  );
}
