/*
 * Code-recall helpers: tokenising, whitespace-insensitive grading,
 * LCS diffs, first-letter scaffolds and a tiny syntax highlighter.
 */

const JS_RE =
  /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|=>|===|!==|==|!=|<=|>=|&&|\|\||\.\.\.|\S/g;
const CSS_RE = /"[^"]*"?|'[^']*'?|#?-?[A-Za-z_][\w-]*|\d+(?:\.\d+)?[a-z%]*|\S/g;

export function tokenRe(lang) {
  return new RegExp((lang === "css" ? CSS_RE : JS_RE).source, "g");
}

export function tokens(line, lang) {
  return String(line ?? "").match(tokenRe(lang)) || [];
}

export const isWord = (t) => /^[A-Za-z_$#-]/.test(t);
export const isNumber = (t) => /^\d/.test(t);
const isString = (t) => /^["'`]/.test(t);

/* normalise one token for comparison: any quote style counts as " */
function normTok(t) {
  if (isString(t)) {
    const body = t.slice(1).replace(/["'`]$/, "");
    return `"${body}"`;
  }
  return t;
}

/* tokens with the forgivable differences removed */
export function normTokens(line, lang) {
  let list = tokens(line, lang).map(normTok);
  if (lang === "css") list = list.filter((t, i) => !(t === ";" && list[i + 1] === "}"));
  while (list.length && (list[list.length - 1] === ";" || list[list.length - 1] === ",")) list.pop();
  return list;
}

export const lineKey = (line, lang) => normTokens(line, lang).join(" ");
export const sameLine = (a, b, lang) => lineKey(a, lang) === lineKey(b, lang);
export const isMeaningful = (line) => /[A-Za-z0-9]/.test(line);
export const isBlank = (line) => !String(line).trim();

/* longest common subsequence → matched index pairs */
export function lcs(a, b, eq = (x, y) => x === y) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = eq(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/* token-level diff of one line */
export function tokenDiff(yours, correct, lang) {
  const a = tokens(yours, lang);
  const b = tokens(correct, lang);
  const pairs = lcs(a.map(normTok), b.map(normTok));
  const okA = new Set(pairs.map((p) => p[0]));
  const okB = new Set(pairs.map((p) => p[1]));
  return {
    yours: a.map((t, i) => ({ t, ok: okA.has(i) })),
    correct: b.map((t, i) => ({ t, ok: okB.has(i) }))
  };
}

/* whole-file diff: which correct lines appear (in order) in what was typed */
export function fileDiff(typed, correctLines, lang) {
  const typedLines = String(typed).split("\n").filter((l) => !isBlank(l));
  const idx = [];
  correctLines.forEach((l, i) => { if (!isBlank(l)) idx.push(i); });
  const pairs = lcs(
    typedLines.map((l) => lineKey(l, lang)),
    idx.map((i) => lineKey(correctLines[i], lang))
  );
  const lineOk = correctLines.map((l) => (isBlank(l) ? null : false));
  const usedTyped = new Set();
  pairs.forEach(([t, c]) => { lineOk[idx[c]] = true; usedTyped.add(t); });
  const extra = typedLines.filter((_, i) => !usedTyped.has(i));
  return { total: idx.length, matched: pairs.length, lineOk, extra };
}

/* first-letter scaffold: `import { useState } from "react";` → `i { u } f "r";` */
export function firstLetters(line, lang) {
  return String(line).replace(tokenRe(lang), (t) => {
    if (isString(t)) {
      const body = t.slice(1).replace(/["'`]$/, "");
      return body ? `${t[0]}${body[0]}…${t[0]}` : t;
    }
    if (isWord(t)) return t.length > 1 ? (t[0] === "#" || t[0] === "-" ? t.slice(0, 2) : t[0]) : t;
    if (isNumber(t)) return t[0];
    return t;
  });
}

export function indentOf(line) {
  return (String(line).match(/^\s*/) || [""])[0];
}

/* ---------------------------------------------------------------- highlight */

const KEYWORDS = new Set([
  "import", "from", "export", "default", "function", "const", "let", "var",
  "return", "if", "else", "true", "false", "null", "undefined", "new", "of", "in"
]);

const HL_JS =
  /\s+|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`(?:[^`\\]|\\.)*`?|[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|=>|===|!==|\S/g;
const HL_CSS = /\s+|"[^"]*"?|'[^']*'?|#?-?[A-Za-z_][\w-]*|\d+(?:\.\d+)?[a-z%]*|\S/g;

export function highlight(line, lang) {
  const src = String(line ?? "");
  const parts = src.match(new RegExp((lang === "css" ? HL_CSS : HL_JS).source, "g")) || [];
  const out = [];
  let prev = "";
  let offset = 0;

  parts.forEach((text, i) => {
    offset += text.length;
    if (/^\s+$/.test(text)) { out.push({ text, cls: "" }); return; }
    const after = src.slice(offset);
    let cls = "p";

    if (lang === "css") {
      if (isString(text)) cls = "s";
      else if (isNumber(text)) cls = "n";
      else if (isWord(text)) {
        if (/^\s*:/.test(after)) cls = "prop";
        else if (/[{]/.test(after) && !/[}]/.test(after.split("{")[0])) cls = "tag";
        else cls = "v";
      }
    } else if (isString(text)) cls = "s";
    else if (isNumber(text)) cls = "n";
    else if (/^[A-Za-z_$]/.test(text)) {
      if (prev === "<" || prev === "/" && parts[i - 2] === "<") cls = "tag";
      else if (KEYWORDS.has(text)) cls = "k";
      else if (/^=[{"]/.test(after)) cls = "attr";
      else if (/^\s*\(/.test(after)) cls = "fn";
      else cls = "id";
    }
    out.push({ text, cls });
    prev = text;
  });
  return out;
}

/* small seeded RNG so a card's blanks stay put while it is open */
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffled(list, rand = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------------------------------------------------------------- mutations */

/* line → parts that keep whitespace, so a swapped token rebuilds the line exactly */
export function splitParts(line, lang) {
  const re = new RegExp(`\\s+|${tokenRe(lang).source}`, "g");
  return (String(line).match(re) || []).map((text) => ({ text, tok: !/^\s+$/.test(text) }));
}

/* plausible look-alikes: the kind of slip you make when you half-remember a line */
const SWAPS = {
  useState: ["useEffect", "useRef"], useSelector: ["useStore", "useState"], useDispatch: ["useAction", "useStore"],
  react: ["react-dom", "react-redux"], "react-redux": ["react", "redux"], "react-dom/client": ["react-dom", "react/client"],
  "@reduxjs/toolkit": ["redux", "react-redux"], "./todoSlice": ["./store", "./todos"], "./store": ["./todoSlice", "./reducer"],
  "./App": ["./app", "./main"], "./index.css": ["./App.css", "./style.css"],
  todos: ["todo", "items"], text: ["value", "title"], setText: ["setValue", "updateText"],
  addTodo: ["createTodo", "toggleTodo"], toggleTodo: ["deleteTodo", "updateTodo"], deleteTodo: ["removeTodo", "addTodo"],
  dispatch: ["useDispatch", "store"], state: ["action", "store"], action: ["state", "payload"], payload: ["value", "data"],
  reducer: ["reducers", "slice"], reducers: ["reducer", "actions"], actions: ["action", "reducers"],
  initialState: ["state", "initial"], name: ["key", "id"], push: ["add", "concat"], find: ["filter", "findIndex"],
  filter: ["find", "map"], map: ["forEach", "filter"], id: ["key", "index"], key: ["id", "ref"], done: ["completed", "checked"],
  trim: ["strip", "length"], target: ["currentTarget", "value"], value: ["defaultValue", "text"],
  onChange: ["onInput", "onClick"], onClick: ["onPress", "onChange"], className: ["class", "style"],
  textDecoration: ["textStyle", "decoration"], "line-through": ["underline", "strike"], none: ["normal", "hidden"],
  container: ["wrapper", "app"], TODOS: ["Todos", "TODO"], Add: ["Submit", "Save"], X: ["Delete", "x"],
  createRoot: ["render", "hydrateRoot"], render: ["mount", "create"], getElementById: ["querySelector", "getElement"],
  root: ["app", "main"], Provider: ["Store", "Context"], store: ["state", "todoStore"],
  configureStore: ["createStore", "createSlice"], todoReducer: ["todoSlice", "reducer"],
  createSlice: ["createReducer", "configureStore"], todoSlice: ["todoReducer", "slice"],
  Date: ["Math", "Time"], now: ["random", "today"], const: ["let", "var"], App: ["Main", "Todo"],
  "sans-serif": ["serif", "monospace"], flex: ["block", "grid"], "justify-content": ["align-items", "text-align"],
  center: ["middle", "left"], "400px": ["500px", "40px"], width: ["max-width", "height"],
  "font-family": ["font", "font-style"], display: ["position", "align"], body: ["html", "main"],
  false: ["true", "null"], true: ["false"], h1: ["h2", "header"], ul: ["ol", "div"], li: ["ul", "div"],
  span: ["p", "label"], div: ["section", "main"], return: ["break"], if: ["while"], default: ["const"]
};
const OPS = { "===": ["==", "!=="], "!==": ["===", "!="], "==": ["==="], "=>": ["="] };
const DROPPABLE = new Set(["!", "default", "new"]);

export function mutations(line, lang, { fallback = false } = {}) {
  const parts = splitParts(line, lang);
  const rebuild = (edits) => parts.map((p, j) => (j in edits ? edits[j] : p.text)).join("");
  const nextTok = (i) => { for (let j = i + 1; j < parts.length; j++) if (parts[j].tok) return j; return -1; };
  const out = [];

  parts.forEach((p, i) => {
    if (!p.tok) return;
    const t = p.text;
    const quoted = /^["'`]/.test(t) && t.length > 1;
    const core = quoted ? t.slice(1, -1) : t;
    [].concat(SWAPS[core] || []).forEach((alt) => out.push(rebuild({ [i]: quoted ? `${t[0]}${alt}${t[0]}` : alt })));
    (OPS[t] || []).forEach((alt) => out.push(rebuild({ [i]: alt })));
    if (DROPPABLE.has(t)) out.push(rebuild({ [i]: "", [i + 1]: parts[i + 1] && !parts[i + 1].tok && t !== "!" ? "" : parts[i + 1]?.text ?? "" }));
    const j = nextTok(i);
    if (t === "(" && j !== -1 && parts[j].text === ")") out.push(rebuild({ [i]: "", [j]: "" }));
    /* (a, b) → (b, a) */
    if (/^[A-Za-z_$]/.test(t) && j !== -1 && parts[j].text === ",") {
      const k = nextTok(j);
      if (k !== -1 && /^[A-Za-z_$]/.test(parts[k].text) && parts[k].text !== t) {
        out.push(rebuild({ [i]: parts[k].text, [k]: t }));
      }
    }
  });

  /* last resort for short lines: drop one bracket or slash */
  if (fallback) {
    parts.forEach((p, i) => {
      if (p.tok && /^[(){}[\]<>/]$/.test(p.text)) out.push(rebuild({ [i]: "" }));
    });
  }

  const seen = new Set([lineKey(line, lang)]);
  return out.filter((l) => {
    const k = lineKey(l, lang);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* gaps where re-inserting line n gives back the same file (blank lines aside) */
export function equivalentGaps(lines, n, lang) {
  const target = lines.filter((l) => !isBlank(l)).map((l) => lineKey(l, lang)).join("\n");
  const rest = lines.filter((_, i) => i !== n);
  const out = [];
  for (let g = 0; g <= rest.length; g++) {
    const trial = [...rest.slice(0, g), lines[n], ...rest.slice(g)];
    if (trial.filter((l) => !isBlank(l)).map((l) => lineKey(l, lang)).join("\n") === target) out.push(g);
  }
  return out;
}
