import iot from "../data/iot.json";
import nlp from "../data/nlp.json";
import { makeCodeBank } from "./codeBank.js";
import * as employeeData from "../data/fdfed.js";
import * as labData from "../data/fdfed-lab.js";

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
    key: "fdfedlab",
    label: "FDFED · Lab 2 practice set",
    short: "Lab 2",
    type: "code",
    caption: "FDFED · Lab 2 practice — 5 problems + the generalized solution",
    bank: makeCodeBank(labData)
  },
  {
    key: "fdfed",
    label: "FDFED · Employee list",
    short: "Employees",
    type: "code",
    caption: "FDFED · Problem 3 employee list · learn it by heart",
    bank: makeCodeBank(employeeData)
  }
];

/* /fdfed opens straight into the FDFED code courses; the other courses are hidden */
const LOCK_PATHS = [{ re: /^\/fdfed\/?$/i, courses: ["fdfedlab", "fdfed"], title: "FDFED" }];
const lock =
  typeof window === "undefined" ? null : LOCK_PATHS.find((l) => l.re.test(window.location.pathname)) || null;
export const LOCKED_COURSES = lock ? lock.courses : null;
export const LOCK_TITLE = lock ? lock.title : null;

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
