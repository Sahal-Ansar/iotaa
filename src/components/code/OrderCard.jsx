import { useMemo, useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl } from "./CodeBits.jsx";
import { isBlank, lineKey, shuffled } from "../../lib/code.js";

export default function OrderCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const correct = useMemo(() => {
    const out = [];
    for (let i = item.from; i <= item.to; i++) {
      if (!isBlank(file.lines[i])) out.push({ id: i, text: file.lines[i] });
    }
    return out;
  }, [file, item.from, item.to]);

  const [pool, setPool] = useState(() => {
    let s = shuffled(correct);
    /* never hand out the answer already solved */
    for (let k = 0; k < 5 && s.every((x, i) => x.id === correct[i].id); k++) s = shuffled(correct);
    return s;
  });
  const [built, setBuilt] = useState([]);
  const [marks, setMarks] = useState(null);

  const add = (x) => {
    if (answered) return;
    setPool((p) => p.filter((y) => y.id !== x.id));
    setBuilt((b) => [...b, x]);
  };
  const remove = (x) => {
    if (answered) return;
    setBuilt((b) => b.filter((y) => y.id !== x.id));
    setPool((p) => [...p, x]);
  };
  const undo = () => built.length && remove(built[built.length - 1]);
  const resetAll = () => { setPool(shuffled(correct)); setBuilt([]); };

  const check = () => {
    if (answered || pool.length) return;
    /* identical lines (e.g. two "});") are interchangeable */
    const m = built.map((x, i) => lineKey(x.text, file.lang) === lineKey(correct[i].text, file.lang));
    setMarks(m);
    onFinish(m.every(Boolean));
  };
  const reveal = () => {
    if (answered) return;
    setMarks(null);
    onFinish(false);
  };

  const right = marks ? marks.filter(Boolean).length : 0;

  return (
    <>
      <p className="qtext small">
        Put <b>{file.name}</b> — {item.label} — back in order. Tap lines from the pile; tap a placed line to send it back.
      </p>

      <div className="built code">
        {built.length === 0 && <div className="empty">Your file builds here, top to bottom.</div>}
        {built.map((x, i) => (
          <button
            type="button"
            key={x.id}
            className={`cl click${marks ? (marks[i] ? " ok" : " no") : ""}`}
            onClick={() => remove(x)}
            disabled={answered}
          >
            <span className="ln">{i + 1}</span>
            <span className="lc"><Hl text={x.text} lang={file.lang} /></span>
          </button>
        ))}
      </div>

      {!answered && pool.length > 0 && (
        <div className="pool">
          {pool.map((x) => (
            <button type="button" key={x.id} className="chipline" onClick={() => add(x)}>
              <Hl text={x.text.trim()} lang={file.lang} />
            </button>
          ))}
        </div>
      )}

      {answered ? (
        <>
          <Feedback
            tone={marks && right === correct.length ? "ok" : "no"}
            verdict={marks ? `${right} / ${correct.length} lines in the right place` : "Correct order"}
          >
            {!(marks && right === correct.length) && (
              <CodeBlock lines={file.lines.slice(item.from, item.to + 1)} lang={file.lang} from={item.from} />
            )}
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={pool.length > 0} onClick={check}>Check order</button>
          <button type="button" className="btn ghost" disabled={!built.length} onClick={undo}>Undo</button>
          <button type="button" className="btn ghost" onClick={resetAll}>Reset</button>
          <button type="button" className="btn ghost" onClick={reveal}>Show answer</button>
        </Actions>
      )}
    </>
  );
}
