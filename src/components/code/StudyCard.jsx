import { useState } from "react";
import RichText from "../RichText.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock } from "./CodeBits.jsx";

export default function StudyCard({ item, files, bank, onNext, isLast }) {
  const file = files[item.f];
  const [allNotes, setAllNotes] = useState(false);
  const [open, setOpen] = useState(() => new Set());
  const [cover, setCover] = useState(false);
  const [shown, setShown] = useState(() => new Set());
  const [flow, setFlow] = useState(item.f === 0);
  const [showRef, setShowRef] = useState(false);

  const toggle = (setter, i) =>
    setter((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i);
      else s.add(i);
      return s;
    });

  const coverOn = () => { setCover(true); setShown(new Set()); };

  return (
    <>
      <div className="filehead">
        <span className="fname">{file.name}</span>
        <RichText as="p" className="frole">{file.role}</RichText>
      </div>

      <div className="toolrow">
        <button type="button" className="pill" aria-pressed={allNotes} onClick={() => setAllNotes((v) => !v)}>
          Explain every line
        </button>
        <button type="button" className="pill" aria-pressed={cover} onClick={() => (cover ? setCover(false) : coverOn())}>
          Cover mode
        </button>
        {cover && (
          <button type="button" className="pill" onClick={() => setShown(new Set(file.lines.map((_, i) => i)))}>
            Reveal all
          </button>
        )}
        <span className="toolhint">
          {cover ? "Say each line out loud, then tap it to check." : "Tap any line for its explanation."}
        </span>
      </div>

      <CodeBlock
        lines={file.lines}
        lang={file.lang}
        row={(i, text) => {
          const note = file.notes[i];
          if (cover && text.trim()) {
            const vis = shown.has(i);
            return {
              className: vis ? "revealed" : "covered",
              onClick: () => toggle(setShown, i)
            };
          }
          if (!note) return null;
          const showNote = allNotes || open.has(i);
          return {
            className: showNote ? "sel" : "",
            onClick: () => toggle(setOpen, i),
            after: showNote ? <RichText as="div" className="note">{note}</RichText> : null
          };
        }}
      />

      {file.reference && (
        <div className="flowbox">
          <button type="button" className="flowtoggle" aria-expanded={showRef} onClick={() => setShowRef((v) => !v)}>
            {file.reference.title} <span aria-hidden="true">{showRef ? "−" : "+"}</span>
          </button>
          {showRef && <CodeBlock lines={file.reference.lines} lang={file.lang} row={() => ({ className: "dim" })} />}
        </div>
      )}

      <div className="flowbox">
        <button type="button" className="flowtoggle" aria-expanded={flow} onClick={() => setFlow((v) => !v)}>
          How the files connect <span aria-hidden="true">{flow ? "−" : "+"}</span>
        </button>
        {flow && bank.flow.length > 0 && (
          <ol>
            {bank.flow.map((t, i) => <RichText as="li" key={i}>{t}</RichText>)}
          </ol>
        )}
      </div>

      <Actions>
        <button type="button" className="btn" onClick={onNext}>{isLast ? "Finish" : "Next file"}</button>
        <Hint><Key>Enter</Key> next file</Hint>
      </Actions>
    </>
  );
}
