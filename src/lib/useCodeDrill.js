import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MIXED_KINDS, codeCounts } from "./codeBank.js";
import { shuffle } from "./grading.js";

/*
 * State for a "code" course (FDFED). Kept apart from useDrill so the quiz
 * courses are untouched; progress lives under its own storage key.
 */

const KEY = "drill-room.code.v1";
const UNSHUFFLED = new Set(["study", "chain", "write"]);

function read() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* progress just won't persist */
  }
}

export function useCodeDrill(courseKey, bank, shuffleOn) {
  const saved = useRef(read()).current;

  const [mode, setMode] = useState(saved.mode || "study");
  const [topics, setTopics] = useState(Array.isArray(saved.topics) ? saved.topics : []);
  const [level, setLevel] = useState(saved.level || "medium");
  const [results, setResults] = useState(saved.results || {});

  const [queue, setQueue] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [retryOnly, setRetryOnly] = useState(null);

  const topicNames = bank.topics;
  const counts = useMemo(() => codeCounts(bank), [bank]);
  const uid = useCallback((kind, item) => `${courseKey}:${kind}:${item.id}`, [courseKey]);

  useEffect(() => {
    write({ mode, topics, level, results });
  }, [mode, topics, level, results]);

  const buildQueue = useCallback(() => {
    const kinds = mode === "mixed" ? MIXED_KINDS : [mode];
    const list = [];
    kinds.forEach((kind) => {
      bank[kind]
        .filter((item) => topics.length === 0 || topics.includes(item.t))
        .forEach((item) => list.push({ kind, item }));
    });
    return shuffleOn && !UNSHUFFLED.has(mode) ? shuffle(list) : list;
  }, [bank, mode, topics, shuffleOn]);

  const reset = useCallback((list) => {
    setQueue(list);
    setCursor(0);
    setAnswered(false);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    setRetryOnly(null);
    reset(buildQueue());
  }, [buildQueue, reset]);

  const restart = useCallback(() => {
    setRetryOnly(null);
    reset(buildQueue());
  }, [buildQueue, reset]);

  const current = cursor < queue.length ? queue[cursor] : null;

  /* ok: true / false records a result; null just marks the card done */
  const finish = useCallback(
    (ok) => {
      if (!current) return;
      if (ok !== null) {
        setResults((prev) => ({ ...prev, [uid(current.kind, current.item)]: ok ? 1 : 0 }));
      }
      setAnswered(true);
    },
    [current, uid]
  );

  const override = useCallback(() => {
    if (!current) return;
    setResults((prev) => ({ ...prev, [uid(current.kind, current.item)]: 1 }));
  }, [current, uid]);

  const next = useCallback(() => {
    setCursor((c) => c + 1);
    setAnswered(false);
    setNonce((n) => n + 1);
    window.scrollTo({ top: 0 });
  }, []);

  const score = useMemo(() => {
    let right = 0;
    let wrong = 0;
    const byTopic = topicNames.map(() => ({ right: 0, total: 0 }));
    queue.forEach(({ kind, item }) => {
      const r = results[uid(kind, item)];
      if (r === undefined) return;
      const bucket = byTopic[item.t];
      if (bucket) {
        bucket.total += 1;
        if (r === 1) bucket.right += 1;
      }
      if (r === 1) right += 1;
      else wrong += 1;
    });
    return { right, wrong, attempted: right + wrong, total: queue.length, byTopic };
  }, [queue, results, uid, topicNames]);

  const retryWrong = useCallback(() => {
    const missed = queue.filter(({ kind, item }) => results[uid(kind, item)] === 0);
    if (!missed.length) return;
    setResults((prev) => {
      const copy = { ...prev };
      missed.forEach(({ kind, item }) => delete copy[uid(kind, item)]);
      return copy;
    });
    setRetryOnly(missed.length);
    reset(missed);
  }, [queue, results, uid, reset]);

  const clearProgress = useCallback(() => {
    setResults((prev) => {
      const copy = {};
      Object.keys(prev).forEach((k) => {
        if (!k.startsWith(`${courseKey}:`)) copy[k] = prev[k];
      });
      return copy;
    });
    restart();
  }, [courseKey, restart]);

  const toggleTopic = useCallback((index) => {
    setTopics((prev) =>
      prev.includes(index) ? prev.filter((t) => t !== index) : [...prev, index]
    );
  }, []);

  return {
    bank, topicNames, counts,
    mode, setMode, topics, setTopics, toggleTopic,
    level, setLevel,
    queue, cursor, current, answered, nonce, retryOnly,
    score, finish, override, next, restart, retryWrong, clearProgress,
    hasWrong: score.wrong > 0
  };
}
