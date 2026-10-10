import { useState } from "react";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, Hl } from "./CodeBits.jsx";
import { isMeaningful, shuffled, tokens } from "../../lib/code.js";

const norm = (t) => (/^["'`]/.test(t) ? `"${t.slice(1, -1)}"` : t);

export default function UnscrambleCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const target = file.lines[item.n];
  const toks = tokens(target, file.lang);
  const [pool, setPool] = useState(() => {
    const list = toks.map((t, id) => ({ t, id }));
    let s = shuffled(list);
    for (let k = 0; k < 5 && s.every((x, i) => norm(x.t) === norm(toks[i])); k++) s = shuffled(list);
    return s;
  });
  const [built, setBuilt] = useState([]);
  const [marks, setMarks] = useState(null);

  let above = item.n - 1;
  while (above >= 0 && !isMeaningful(file.lines[above])) above--;

  const add = (x) => { if (answered) return; setPool((p) => p.filter((y) => y.id !== x.id)); setBuilt((b) => [...b, x]); };
  const remove = (x) => { if (answered) return; setBuilt((b) => b.filter((y) => y.id !== x.id)); setPool((p) => [...p, x]); };

  const check = () => {
    if (answered || pool.length) return;
    const m = built.map((x, i) => norm(x.t) === norm(toks[i]));
    setMarks(m);
    onFinish(m.every(Boolean));
  };

  return (
    <>
      <p className="qtext small">
        Rebuild line {item.n + 1} of <b>{file.name}</b> — tap the pieces in order.
      </p>
      {above >= 0 && <CodeBlock lines={[file.lines[above]]} lang={file.lang} from={above} row={() => ({ className: "dim" })} />}

      <div className="tokbuilt">
        {built.length === 0 && <span className="empty">Line {item.n + 1} builds here</span>}
        {built.map((x, i) => (
          <button key={x.id} type="button" className={`tokchip${marks ? (marks[i] ? " ok" : " no") : ""}`} disabled={answered} onClick={() => remove(x)}>
            <Hl text={x.t} lang={file.lang} />
          </button>
        ))}
      </div>

      {!answered && (
        <div className="tokpool">
          {pool.map((x) => (
            <button key={x.id} type="button" className="tokchip" onClick={() => add(x)}>
              <Hl text={x.t} lang={file.lang} />
            </button>
          ))}
        </div>
      )}

      {answered ? (
        <>
          <Feedback tone={marks && marks.every(Boolean) ? "ok" : "no"} verdict={marks && marks.every(Boolean) ? "Perfect order" : "Correct line"}>
            <code className="corr"><Hl text={target.trim()} lang={file.lang} /></code>
          </Feedback>
          <Actions>
            <button type="button" className="btn" onClick={onNext}>Next</button>
            <Hint><Key>Enter</Key> to continue</Hint>
          </Actions>
        </>
      ) : (
        <Actions>
          <button type="button" className="btn" disabled={pool.length > 0} onClick={check}>Check</button>
          <button type="button" className="btn ghost" disabled={!built.length} onClick={() => remove(built[built.length - 1])}>Undo</button>
          <button type="button" className="btn ghost" onClick={() => { setMarks(null); onFinish(false); }}>Show line</button>
        </Actions>
      )}
    </>
  );
}
