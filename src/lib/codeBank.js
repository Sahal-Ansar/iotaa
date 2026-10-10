import { FILES, BLANK_CHUNKS, ORDER_CHUNKS, BUGS, QUIZ } from "../data/fdfed.js";
import { isMeaningful, lineKey, rng, shuffled } from "./code.js";

/*
 * Turns the raw FDFED data into drill items, one list per round.
 * `t` is the file index so the sidebar's file chips can filter every round.
 */

const fileNames = FILES.map((f) => f.name);

const study = FILES.map((f, i) => ({ id: `s${i}`, t: i, f: i }));

const line = [];
FILES.forEach((file, f) => {
  file.lines.forEach((text, n) => {
    if (isMeaningful(text)) line.push({ id: `l${f}-${n}`, t: f, f, n });
  });
});

const chunkItems = (list, prefix) =>
  list.map((c, i) => ({ id: `${prefix}${i}`, t: c.f, ...c }));

const cloze = chunkItems(BLANK_CHUNKS, "c");
const letters = chunkItems(BLANK_CHUNKS, "h");
const order = chunkItems(ORDER_CHUNKS, "o");
const bug = BUGS.map((b, i) => ({ id: `b${i}`, t: b.f, ...b }));
const chain = FILES.map((f, i) => ({ id: `n${i}`, t: i, f: i }));
const write = FILES.map((f, i) => ({ id: `w${i}`, t: i, f: i }));

/* concept questions + generated "which file is this line from?" questions */
const LETTERS = ["a", "b", "c", "d", "e"];
const quiz = QUIZ.map((q, i) => ({
  id: `q${i}`,
  t: q.f,
  q: q.q,
  opts: q.opts.map((t, k) => ({ k: LETTERS[k], t })),
  ans: LETTERS[q.a],
  exp: q.exp
}));

const keyCount = {};
FILES.forEach((file) =>
  file.lines.forEach((l) => {
    const k = lineKey(l, file.lang);
    keyCount[k] = (keyCount[k] || 0) + 1;
  })
);
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pickRand = rng(7);
FILES.forEach((file, f) => {
  const candidates = file.lines
    .map((text, n) => ({ text, n }))
    .filter(({ text }) => isMeaningful(text) && text.trim().length > 14 && keyCount[lineKey(text, file.lang)] === 1);
  const take = shuffled(candidates, pickRand).slice(0, Math.max(2, Math.ceil(candidates.length / 3)));
  take.sort((a, b) => a.n - b.n).forEach(({ text, n }) => {
    quiz.push({
      id: `wf${f}-${n}`,
      t: f,
      q: `Which file contains this line?<br><code>${escape(text.trim())}</code>`,
      opts: fileNames.map((t, k) => ({ k: LETTERS[k], t })),
      ans: LETTERS[f],
      exp: `It is line ${n + 1} of <b>${file.name}</b>. ${file.role}`
    });
  });
});

export const CODE_BANK = {
  topics: fileNames,
  files: FILES,
  study, line, cloze, bug, order, chain, letters, write, quiz
};

export const CODE_MODES = [
  { key: "study", label: "Study the files", blurb: "Read every line with its explanation, then cover and recall." },
  { key: "line", label: "Line fill", blurb: "One line is missing — type it exactly." },
  { key: "cloze", label: "Token blanks", blurb: "Words are blanked inside the code — fill them in." },
  { key: "bug", label: "Fix the bug", blurb: "One line is wrong. Find it, then type the fix." },
  { key: "order", label: "Line order", blurb: "Lines are shuffled — tap them back into order." },
  { key: "letters", label: "First letters", blurb: "Only the first letter of each word is shown — rebuild each line." },
  { key: "chain", label: "Chain recall", blurb: "Type the file top to bottom, one line at a time." },
  { key: "write", label: "Write from memory", blurb: "Blank page. Write the whole file, then see the diff." },
  { key: "quiz", label: "Concept quiz", blurb: "Why each line is there, and which file it lives in." },
  { key: "mixed", label: "Mixed rounds", blurb: "Line fill, blanks, bugs and quiz shuffled together." }
];

export const CODE_PREFIX = {
  study: "STUDY",
  line: "LINE",
  cloze: "BLANKS",
  bug: "BUG",
  order: "ORDER",
  letters: "LETTERS",
  chain: "CHAIN",
  write: "WRITE",
  quiz: "QUIZ"
};

export const MIXED_KINDS = ["line", "cloze", "bug", "quiz"];

export function codeCounts(bank) {
  const c = {};
  CODE_MODES.forEach(({ key }) => {
    c[key] = key === "mixed"
      ? MIXED_KINDS.reduce((sum, k) => sum + bank[k].length, 0)
      : bank[key].length;
  });
  return c;
}
