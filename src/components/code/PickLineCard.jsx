import { useState } from "react";
import RichText from "../RichText.jsx";
import Feedback from "../Feedback.jsx";
import Actions, { Hint, Key } from "../Actions.jsx";
import { CodeBlock, OptionList, useChoiceKeys } from "./CodeBits.jsx";
import { distractors } from "../../lib/codeBank.js";
import { isMeaningful, lineKey, shuffled } from "../../lib/code.js";

/* variant "pick": choose the exact line among look-alikes.
   variant "next": choose which line comes next. */
export default function PickLineCard({ item, files, answered, onFinish, onNext, variant = "pick" }) {
  const file = files[item.f];
  const real = file.lines[item.n];

  const [opts] = useState(() => {
    let others;
    if (variant === "next") {
      const key = lineKey(real, file.lang);
      const seen = new Set([key]);
      const pool = file.lines
        .map((text, n) => ({ text, n }))
        .filter(({ text, n }) => n !== item.n && isMeaningful(text))
        .sort((a, b) => Math.abs(a.n - item.n) - Math.abs(b.n - item.n) + (Math.random() - 0.5) * 6);
      others = [];
      pool.forEach(({ text }) => {
        const k = lineKey(text, file.lang);
        if (!seen.has(k) && others.length < 3) { seen.add(k); others.push({ text }); }
      });
    } else {
      others = distractors(item.f, item.n, 3);
    }
    return shuffled([{ text: real, right: true }, ...others]);
  });
  const answer = opts.findIndex((o) => o.right);
  const [pick, setPick] = useState(null);

  const confirm = () => {
    if (answered || pick === null) return;
    onFinish(pick === answer);
  };
  useChoiceKeys({ count: opts.length, answered, pick, onPick: setPick, onConfirm: confirm });

  const from = Math.max(0, item.n - (variant === "next" ? 6 : 4));
  const to = variant === "next" ? item.n : Math.min(file.lines.length - 1, item.n + 4);
  const lines = file.lines.slice(from, to + 1);
  const picked = pick !== null ? opts[pick] : null;

  return (
    <>
      <p className="qtext small">
        {variant === "next"
          ? <>In <b>{file.name}</b>, which line comes next?</>
          : <>Which is the exact line {item.n + 1} of <b>{file.name}</b>?</>}
      </p>

      <CodeBlock
        lines={lines}
        lang={file.lang}
        from={from}
        row={(i) =>
          i === item.n
            ? {
                className: answered ? (pick === answer ? "ok" : "no") : "target",
                content: answered ? undefined : <span className="qmark">{variant === "next" ? "?" : "▢ ▢ ▢"}</span>
              }
            : null
        }
      />

      <OptionList options={opts.map((o) => o.text)} pick={pick} answer={answer} answered={answered} onPick={setPick} lang={file.lang} />

      {answered ? (
        <>
          <Feedback tone={pick === answer ? "ok" : "no"} verdict={pick === answer ? "Correct" : `Answer is ${answer + 1}`}>
            {picked && !picked.right && picked.why && <RichText as="p">{picked.why}</RichText>}
            {file.notes[item.n] && <RichText as="p">{file.notes[item.n]}</RichText>}
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
