import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COURSES, DEFAULT_COURSE, countsFor, getCourse } from "./courses.js";
import { isBlankCorrect, shuffle } from "./grading.js";
import { readSaved, writeSaved } from "./storage.js";

export { COURSES };

/* Results are namespaced by course so the two sets never collide. */
const uid = (course, kind, item) => `${course}:${kind}:${item.id}`;

export function useDrill() {
  const saved = useRef(readSaved()).current;

  const [courseKey, setCourseKey] = useState(saved.course || DEFAULT_COURSE);
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

  const course = getCourse(courseKey);
  const bank = course.bank;
  const topicNames = bank.topics;
  const counts = useMemo(() => countsFor(bank), [bank]);

  useEffect(() => {
    writeSaved({ course: courseKey, mode, topics, shuffle: shuffleOn, theme, results });
  }, [courseKey, mode, topics, shuffleOn, theme, results]);

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
      bank[kind].filter(inTopic).forEach((item) => list.push({ kind, item }));
    });
    return shuffleOn ? shuffle(list) : list;
  }, [bank, mode, inTopic, shuffleOn]);

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

  /* rebuild whenever course, mode, topics or shuffle change */
  useEffect(() => {
    setRetryOnly(null);
    setQueue(buildQueue());
    setCursor(0);
    clearCard();
  }, [buildQueue, clearCard]);

  /* switching course invalidates the module filter — module 3 means
     something different in each bank, so start from "All" */
  const changeCourse = useCallback((key) => {
    setCourseKey(key);
    setTopics([]);
  }, []);

  const current = cursor < queue.length ? queue[cursor] : null;

  const score = useMemo(() => {
    let right = 0;
    let wrong = 0;
    const byTopic = topicNames.map(() => ({ right: 0, total: 0 }));
    queue.forEach(({ kind, item }) => {
      const r = results[uid(courseKey, kind, item)];
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
  }, [queue, results, courseKey, topicNames]);

  const record = useCallback(
    (kind, item, ok) => {
      setResults((prev) => ({ ...prev, [uid(courseKey, kind, item)]: ok ? 1 : 0 }));
    },
    [courseKey]
  );

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
      const ok = isBlankCorrect(typed, item.acc || [item.ans]);
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
    const missed = queue.filter(
      ({ kind, item }) => results[uid(courseKey, kind, item)] === 0
    );
    if (!missed.length) return;
    setResults((prev) => {
      const copy = { ...prev };
      missed.forEach(({ kind, item }) => delete copy[uid(courseKey, kind, item)]);
      return copy;
    });
    setRetryOnly(missed.length);
    setQueue(missed);
    setCursor(0);
    clearCard();
  }, [queue, results, courseKey, clearCard]);

  /* clears only the course you are looking at */
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
    course, courseKey, changeCourse,
    topicNames, counts,
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
