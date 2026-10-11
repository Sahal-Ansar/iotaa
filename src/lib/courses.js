import iot from "../data/iot.json";
import nlp from "../data/nlp.json";
import { CODE_BANK } from "./codeBank.js";

/* Match-the-pairs sets are authored as a group, so their module is tagged here. */
const MATCH_TOPICS = {
  iot: [6, 4, 2, 1, 7],
  nlp: [0, 3, 6, 7, 7]
};

function prepare(key, bank) {
  return {
    ...bank,
    match: bank.match.map((set, i) => ({
      ...set,
      id: set.n,
      t: bank.match[i].t ?? MATCH_TOPICS[key][i]
    }))
  };
}

export const COURSES = [
  {
    key: "iot",
    label: "Internet of Things",
    short: "IoT",
    caption: "IoT & Applications · active recall",
    bank: prepare("iot", iot)
  },
  {
    key: "nlp",
    label: "Natural Language Processing",
    short: "NLP",
    caption: "NLP · Units 1–3 · active recall",
    bank: prepare("nlp", nlp)
  },
  {
    key: "fdfed",
    label: "FDFED · Employee list",
    short: "FDFED",
    type: "code",
    caption: "FDFED · Problem 3 employee list · learn it by heart",
    bank: CODE_BANK
  }
];

/* /fdfed opens straight into that course with the switcher hidden */
const LOCK_PATHS = { fdfed: /^\/fdfed\/?$/i };
export const LOCKED_COURSE =
  typeof window === "undefined"
    ? null
    : Object.keys(LOCK_PATHS).find((k) => LOCK_PATHS[k].test(window.location.pathname)) || null;

export const DEFAULT_COURSE = "iot";

export function getCourse(key) {
  return COURSES.find((c) => c.key === key) || COURSES[0];
}

export function countsFor(bank) {
  if (!bank.mcq) return {};
  return {
    mcq: bank.mcq.length,
    fitb: bank.fitb.length,
    tf: bank.tf.length,
    match: bank.match.length,
    sa: bank.sa.length,
    mixed: bank.mcq.length + bank.fitb.length + bank.tf.length
  };
}
