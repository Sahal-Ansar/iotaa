import iot from "../data/iot.json";
import nlp from "../data/nlp.json";

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
  }
];

export const DEFAULT_COURSE = "iot";

export function getCourse(key) {
  return COURSES.find((c) => c.key === key) || COURSES[0];
}

export function countsFor(bank) {
  return {
    mcq: bank.mcq.length,
    fitb: bank.fitb.length,
    tf: bank.tf.length,
    match: bank.match.length,
    sa: bank.sa.length,
    mixed: bank.mcq.length + bank.fitb.length + bank.tf.length
  };
}
