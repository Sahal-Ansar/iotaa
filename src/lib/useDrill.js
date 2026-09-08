import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import bank from "../data/questions.json";
import { MATCH_TOPICS } from "./constants.js";
import { isBlankCorrect, shuffle } from "./grading.js";
import { readSaved, writeSaved } from "./storage.js";

/* The match sets are authored as a group, so tag them here. */
const DATA = {
  ...bank,
  match: bank.match.map((set, i) => ({ ...set, id: set.n, t: MATCH_TOPICS[i] }))
};

export const TOPICS = DATA.topics;
export const COUNTS = {
  mcq: DATA.mcq.length,
  fitb: DATA.fitb.length,
  tf: DATA.tf.length,
  match: DATA.match.length,
  sa: DATA.sa.length,
  mixed: DATA.mcq.length + DATA.fitb.length + DATA.tf.length
};

const uid = (kind, item) => `${kind}:${item.id}`;

export function useDrill() {
  const saved = useRef(readSaved()).current;

  const [mode, setMode] = useState(saved.mode || "mcq");
  const [topics, setTopics] = useState(
    Array.isArray(saved.topics) ? saved.topics : []
  );
  const [shuffleOn, setShuffleOn] = useState(
    typeof saved.shuffle === "boolean" ? saved.shuffle : true
  );
  const [theme, setTheme] = useState(saved.theme || null);
  const [results, setResults] = useState(saved.results || {});

  const [queue, setQueue] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [pick, setPick] = useState(null);
  const [typed, setTyped] = useState("");
  const [pairs, setPairs] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [retryOnly, setRetryOnly] = useState(null);

  useEffect(() => {
    writeSaved({ mode, topics, shuffle: shuffleOn, theme, results });
  }, [mode, topics, shuffleOn, theme, results]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }, [theme]);

  const inTopic = useCallback(
    (item) => topics.length === 0 || topics.includes(item.t),
    [topics]
  );

  const buildQueue = useCallback(() => {
    const kinds = mode === "mixed" ? ["mcq", "fitb", "tf"] : [mode];
    const list = [];
    kinds.forEach((kind) => {
      DATA[kind].filter(inTopic).forEach((item) => list.push({ kind, item }));
    });
    return shuffleOn ? shuffle(list) : list;
  }, [mode, inTopic, shuffleOn]);

  const clearCard = useCallback(() => {
    setAnswered(false);
    setPick(null);
    setTyped("");
    setPairs({});
    setRevealed(false);
  }, []);

  const restart = useCallback(() => {
    setRetryOnly(null);
    setQueue(buildQueue());
    setCursor(0);
    clearCard();
  }, [buildQueue, clearCard]);

  /* rebuild whenever the selection changes */
  useEffect(() => {
    setRetryOnly(null);
    setQueue(buildQueue());
    setCursor(0);
    clearCard();
  }, [buildQueue, clearCard]);

  const current = cursor < queue.length ? queue[cursor] : null;

  const score = useMemo(() => {
    let right = 0;
    let wrong = 0;
    const byTopic = TOPICS.map(() => ({ right: 0, total: 0 }));
    queue.forEach(({ kind, item }) => {
      const r = results[uid(kind, item)];
      if (r === undefined) return;
      const bucket = byTopic[item.t];
      bucket.total += 1;
      if (r === 1) {
        right += 1;
        bucket.right += 1;
      } else {
        wrong += 1;
      }
    });
    return { right, wrong, attempted: right + wrong, total: queue.length, byTopic };
  }, [queue, results]);

  const record = useCallback((kind, item, ok) => {
    setResults((prev) => ({ ...prev, [uid(kind, item)]: ok ? 1 : 0 }));
  }, []);

  const next = useCallback(() => {
    setCursor((c) => c + 1);
    clearCard();
    window.scrollTo({ top: 0 });
  }, [clearCard]);

  const confirm = useCallback(() => {
    if (!current || answered) return;
    const { kind, item } = current;

    if (kind === "mcq") {
      if (!pick) return;
      record(kind, item, pick === item.ans);
    } else if (kind === "tf") {
      if (pick === null) return;
      record(kind, item, pick === item.ans);
    } else if (kind === "fitb") {
      const ok = isBlankCorrect(typed, item.acc);
      setPick(ok ? "ok" : "no");
      record(kind, item, ok);
    } else if (kind === "match") {
      const got = item.left.filter((row) => pairs[row.n] === item.ans[row.n]).length;
      record(kind, item, got === item.left.length);
    } else {
      return;
    }
    setAnswered(true);
  }, [current, answered, pick, typed, pairs, record]);

  const skip = useCallback(() => {
    if (!current) return;
    const { kind, item } = current;
    if (kind === "sa") {
      setRevealed(true);
      return;
    }
    if (kind === "fitb") setPick("no");
    record(kind, item, false);
    setAnswered(true);
  }, [current, record]);

  const selfMark = useCallback(
    (ok) => {
      if (!current) return;
      record(current.kind, current.item, ok);
      next();
    },
    [current, record, next]
  );

  const overrideCorrect = useCallback(() => {
    if (!current) return;
    record(current.kind, current.item, true);
    setPick("ok");
  }, [current, record]);

  const retryWrong = useCallback(() => {
    const missed = queue.filter(({ kind, item }) => results[uid(kind, item)] === 0);
    if (!missed.length) return;
    setResults((prev) => {
      const copy = { ...prev };
      missed.forEach(({ kind, item }) => delete copy[uid(kind, item)]);
      return copy;
    });
    setRetryOnly(missed.length);
    setQueue(missed);
    setCursor(0);
    clearCard();
  }, [queue, results, clearCard]);

  const clearProgress = useCallback(() => {
    setResults({});
    restart();
  }, [restart]);

  const toggleTopic = useCallback((index) => {
    setTopics((prev) =>
      prev.includes(index) ? prev.filter((t) => t !== index) : [...prev, index]
    );
  }, []);

  return {
    mode, setMode,
    topics, setTopics, toggleTopic,
    shuffleOn, setShuffleOn,
    theme, setTheme,
    queue, cursor, current, answered, pick, setPick, typed, setTyped,
    pairs, setPairs, revealed, setRevealed, retryOnly,
    score, confirm, next, skip, selfMark, overrideCorrect,
    restart, retryWrong, clearProgress,
    hasWrong: score.wrong > 0
  };
}
