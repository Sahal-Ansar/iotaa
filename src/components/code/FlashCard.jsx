import { useEffect, useState } from "react";
import RichText from "../RichText.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock } from "./CodeBits.jsx";
import { isMeaningful } from "../../lib/code.js";

/* self-marked: see the line above, say this one, flip */
export default function FlashCard({ item, files, answered, onFinish, onNext }) {
  const file = files[item.f];
  const [flipped, setFlipped] = useState(false);
  const [mark, setMark] = useState(null);

  let above = item.n - 1;
  while (above >= 0 && !isMeaningful(file.lines[above])) above--;
  const from = Math.max(0, above - 1);

  const grade = (ok) => {
    if (answered) return;
    setMark(ok);
    onFinish(ok);
  };

  useEffect(() => {
    function onKey(e) {
      if (answered || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!flipped && (e.key === " " || e.key === "Enter")) { e.preventDefault(); e.stopPropagation(); setFlipped(true); return; }
      if (flipped && (e.key === "1" || e.key.toLowerCase() === "y")) { e.preventDefault(); grade(true); }
      if (flipped && (e.key === "2" || e.key.toLowerCase() === "n")) { e.preventDefault(); grade(false); }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return (
    <>
      <p className="qtext small">
        <b>{file.name}</b>, line {item.n + 1}. Say the line out loud (or in your head), then flip.
      </p>

      <CodeBlock
        lines={file.lines.slice(from, item.n + 1)}
        lang={file.lang}
        from={from}
        row={(i) =>
          i === item.n
            ? flipped
              ? { className: answered ? (mark ? "ok" : "no") : "sel" }
              : { className: "target", content: <span className="qmark">tap Flip to reveal</span> }
            : { className: "dim" }
        }
      />

      {flipped && file.notes[item.n] && <RichText as="div" className="note solo">{file.notes[item.n]}</RichText>}

      {!flipped && (
        <Actions>
          <button type="button" className="btn" onClick={() => setFlipped(true)}>Flip</button>
          <Hint><Key>Space</Key> flip</Hint>
        </Actions>
      )}
      {flipped && !answered && (
        <Actions>
          <button type="button" className="btn okbtn" onClick={() => grade(true)}>Knew it</button>
          <button type="button" className="btn ghost" onClick={() => grade(false)}>Didn't</button>
          <Hint><Key>1</Key> knew · <Key>2</Key> didn't</Hint>
        </Actions>
      )}
      {answered && (
        <Actions>
          <button type="button" className="btn" onClick={onNext}>Next</button>
          <Hint><Key>Enter</Key> to continue</Hint>
        </Actions>
      )}
    </>
  );
}
