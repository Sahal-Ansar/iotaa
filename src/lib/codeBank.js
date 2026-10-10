import { FILES, BLANK_CHUNKS, ORDER_CHUNKS, BUGS, QUIZ } from "../data/fdfed.js";
import { isBlank, isMeaningful, lineKey, mutations, rng, shuffled, tokens } from "./code.js";

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

/* ------------------------------------------------------------ new rounds */

const meaningful = [];
FILES.forEach((file, f) =>
  file.lines.forEach((text, n) => { if (isMeaningful(text)) meaningful.push({ f, n, text, lang: file.lang }); })
);
const fileKeyCount = FILES.map((file) => {
  const c = {};
  file.lines.forEach((l) => { const k = lineKey(l, file.lang); c[k] = (c[k] || 0) + 1; });
  return c;
});
const uniqueInFile = (m) => fileKeyCount[m.f][lineKey(m.text, m.lang)] === 1;
const nonBlankCount = (f) => FILES[f].lines.filter((l) => !isBlank(l)).length;
const lineItems = (prefix, list) => list.map((m) => ({ id: `${prefix}${m.f}-${m.n}`, t: m.f, f: m.f, n: m.n }));

const BUG_BY_LINE = {};
BUGS.forEach((b) => { (BUG_BY_LINE[`${b.f}:${b.line}`] ||= []).push(b); });

/* wrong-but-plausible versions of a line, hand-written bugs first */
export function distractors(f, n, count, rand = Math.random) {
  const file = FILES[f];
  const line = file.lines[n];
  const indent = (line.match(/^\s*/) || [""])[0];
  const seen = new Set([lineKey(line, file.lang)]);
  const out = [];
  const add = (text, why) => {
    const k = lineKey(text, file.lang);
    if (seen.has(k) || out.length >= count) return;
    seen.add(k);
    out.push({ text: indent + text.trim(), why });
  };
  shuffled(BUG_BY_LINE[`${f}:${n}`] || [], rand).slice(0, 1).forEach((b) => add(b.bad, b.why));
  shuffled(mutations(line, file.lang), rand).forEach((t) => add(t));
  shuffled(mutations(line, file.lang, { fallback: true }), rand).forEach((t) => add(t));
  return out;
}

const realCandidates = meaningful.filter((m) => distractors(m.f, m.n, 1).length);

const NOTE_FILES = FILES.map((file) => file.notes.filter(Boolean).length >= 4);

export const INTRUDERS = {
  js: [
    'import { useEffect } from "react";',
    "const [todos, setTodos] = useState([]);",
    "console.log(todos);",
    "return state;",
    "export default store;",
    'import "./App.css";',
    "state.splice(index, 1);",
    "const store = createStore(todoReducer);",
    "useEffect(() => {}, []);",
    "<p>{todos.length} left</p>",
    'import { combineReducers } from "redux";',
    "clearDone: (state) => state.filter((x) => !x.done),",
    "export const selectTodos = (state) => state.todos;",
    "ReactDOM.render(<App />, root);",
    "const handleDelete = (id) => dispatch(deleteTodo(id));",
    "<form onSubmit={handleAdd}>"
  ],
  css: [
    "h1 { color: navy; }",
    "ul { list-style: none; }",
    "* { margin: 0; }",
    "li { cursor: pointer; }",
    "button { margin-left: 8px; }"
  ]
};
export const langGroup = (lang) => (lang === "css" ? "css" : "js");

const tripleFiles = FILES.map((_, f) => new Set(BUGS.filter((b) => b.f === f).map((b) => b.line)).size >= 3);

const flash = lineItems("fc", meaningful);
const explain = lineItems("ex", meaningful.filter((m) => FILES[m.f].notes[m.n]));
const real = lineItems("rf", realCandidates);
const pick = lineItems("pk", meaningful.filter((m) => distractors(m.f, m.n, 2).length >= 2));
const next = lineItems("nx", meaningful.filter((m) =>
  new Set(FILES[m.f].lines.filter(isMeaningful).map((l) => lineKey(l, m.lang))).size >= 5 &&
  FILES[m.f].lines.slice(0, m.n).some(isMeaningful)));
const whichnote = lineItems("wn", meaningful.filter((m) => NOTE_FILES[m.f] && FILES[m.f].notes[m.n]));
const unscramble = lineItems("us", meaningful.filter((m) => {
  const n = tokens(m.text, m.lang).length;
  return n >= 4 && n <= 24;
}));
const place = lineItems("pl", meaningful.filter((m) => uniqueInFile(m) && nonBlankCount(m.f) >= 4));
const missing = lineItems("ms", meaningful.filter((m) => uniqueInFile(m) && nonBlankCount(m.f) >= 4));
const finish = lineItems("fn", meaningful.filter((m) => tokens(m.text, m.lang).length >= 4));
const prev = lineItems("pv", meaningful.filter((m) => FILES[m.f].lines.slice(m.n + 1).some((l) => !isBlank(l))));
const swap = [];
ORDER_CHUNKS.forEach((c, i) => {
  const distinct = new Set();
  for (let n = c.from; n <= c.to; n++) if (!isBlank(FILES[c.f].lines[n])) distinct.add(lineKey(FILES[c.f].lines[n], FILES[c.f].lang));
  if (distinct.size >= 4) [0, 1].forEach((r) => swap.push({ id: `sw${i}-${r}`, t: c.f, ...c }));
});
const symbols = chunkItems(BLANK_CHUNKS.filter((c) => c.f !== 4), "sy");
const imports = FILES.map((file, f) => ({ id: `im${f}`, t: f, f, from: 0, to: file.lines.length - 1, label: "imports & exports" }))
  .filter((it) => FILES[it.f].lines.some((l) => /^\s*(import|export)\b/.test(l)));
const intruder = [];
FILES.forEach((_, f) => [0, 1, 2].forEach((r) => intruder.push({ id: `in${f}-${r}`, t: f, f })));
const triple = [];
FILES.forEach((_, f) => {
  if (!tripleFiles[f]) return;
  const reps = f === 0 ? 3 : 2;
  for (let r = 0; r < reps; r++) triple.push({ id: `tb${f}-${r}`, t: f, f });
});
const speed = real.map((it) => ({ ...it, id: `sp${it.f}-${it.n}` }));

export const CODE_BANK = {
  topics: fileNames,
  files: FILES,
  study, line, cloze, bug, order, chain, letters, write, quiz,
  flash, explain, real, pick, next, whichnote, unscramble, place, swap,
  finish, prev, symbols, imports, missing, intruder, triple, speed,
  survival: [], mixed: []
};

export const CODE_MODES = [
  { group: "Learn", key: "study", label: "Study the files", blurb: "Read every line with its explanation, then cover and recall." },
  { group: "Learn", key: "flash", label: "Flashcards", blurb: "See the line above and the file position — say the line, flip, be honest." },
  { group: "Learn", key: "explain", label: "Explain → code", blurb: "You get the explanation. Type the line it describes." },

  { group: "Recognise", key: "real", label: "Real or fake", blurb: "Is this line exactly as it is in the file?" },
  { group: "Recognise", key: "pick", label: "Pick the line", blurb: "Four near-identical lines. Only one is right." },
  { group: "Recognise", key: "next", label: "What comes next", blurb: "Given the lines so far, choose the next one." },
  { group: "Recognise", key: "whichnote", label: "What does it do", blurb: "Match the line to its explanation." },
  { group: "Recognise", key: "quiz", label: "Concept quiz", blurb: "Why each line is there, and which file it lives in." },

  { group: "Rebuild", key: "order", label: "Line order", blurb: "Lines are shuffled — tap them back into order." },
  { group: "Rebuild", key: "unscramble", label: "Unscramble the line", blurb: "One line's words are shuffled — tap them back in order." },
  { group: "Rebuild", key: "place", label: "Place the line", blurb: "Tap the gap where this line belongs." },
  { group: "Rebuild", key: "swap", label: "Swapped lines", blurb: "Two lines have traded places. Tap both." },

  { group: "Recall", key: "line", label: "Line fill", blurb: "One line is missing — type it exactly." },
  { group: "Recall", key: "finish", label: "Finish the line", blurb: "The line is started for you. Type the rest." },
  { group: "Recall", key: "prev", label: "Line before", blurb: "Recall backwards: type the line that comes above." },
  { group: "Recall", key: "cloze", label: "Token blanks", blurb: "Words are blanked inside the code — fill them in." },
  { group: "Recall", key: "symbols", label: "Symbol blanks", blurb: "Only the brackets, arrows and dots are missing." },
  { group: "Recall", key: "letters", label: "First letters", blurb: "Only the first letter of each word is shown — rebuild each line." },
  { group: "Recall", key: "imports", label: "Imports & exports", blurb: "Every import and export line is blank. Fill them all in." },
  { group: "Recall", key: "chain", label: "Chain recall", blurb: "Type the file top to bottom, one line at a time." },

  { group: "Repair", key: "bug", label: "Fix the bug", blurb: "One line is wrong. Find it, then type the fix." },
  { group: "Repair", key: "missing", label: "Find the missing line", blurb: "A line was deleted and the gap closed up. Find where, then type it." },
  { group: "Repair", key: "intruder", label: "Spot the intruder", blurb: "One extra line was slipped in. Tap it." },
  { group: "Repair", key: "triple", label: "Triple bug", blurb: "Three lines are broken in the same file. Find and fix all three." },

  { group: "Test", key: "write", label: "Write from memory", blurb: "Blank page. Write the whole file, then see the diff." },
  { group: "Test", key: "speed", label: "Speed round", blurb: "Real or fake against an 8-second clock. 25 lines." },
  { group: "Test", key: "survival", label: "Survival", blurb: "Every kind of question, shuffled. Three wrong and it's over." },
  { group: "Test", key: "mixed", label: "Mixed rounds", blurb: "Line fill, blanks, bugs, quiz and more shuffled together." }
];

export const CODE_PREFIX = {
  study: "STUDY", flash: "CARD", explain: "EXPLAIN", real: "REAL?", pick: "PICK", next: "NEXT",
  whichnote: "MEANING", quiz: "QUIZ", order: "ORDER", unscramble: "UNSCRAMBLE", place: "PLACE",
  swap: "SWAP", line: "LINE", finish: "FINISH", prev: "BEFORE", cloze: "BLANKS", symbols: "SYMBOLS",
  letters: "LETTERS", imports: "IMPORTS", chain: "CHAIN", bug: "BUG", missing: "MISSING",
  intruder: "INTRUDER", triple: "TRIPLE BUG", write: "WRITE", speed: "SPEED"
};

export const MIXED_KINDS = ["line", "cloze", "bug", "quiz", "real", "pick", "next", "finish", "unscramble", "place"];
export const SURVIVAL_KINDS = ["real", "pick", "next", "line", "finish", "bug", "quiz", "whichnote", "unscramble", "symbols"];
export const CAPS = { speed: 25 };
export const SURVIVAL_LIVES = 3;

export function codeCounts(bank) {
  const c = {};
  CODE_MODES.forEach(({ key }) => {
    if (key === "mixed") c[key] = MIXED_KINDS.reduce((sum, k) => sum + bank[k].length, 0);
    else if (key === "survival") c[key] = "∞";
    else c[key] = Math.min(bank[key].length, CAPS[key] || Infinity);
  });
  return c;
}
