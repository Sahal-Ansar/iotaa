export const MODES = [
  { key: "mcq", label: "Multiple choice" },
  { key: "fitb", label: "Fill the blank" },
  { key: "tf", label: "True or false" },
  { key: "match", label: "Match the pairs" },
  { key: "sa", label: "Short answer" },
  { key: "mixed", label: "Mixed drill" }
];

export const PREFIX = {
  mcq: "MCQ",
  fitb: "BLANK",
  tf: "T/F",
  match: "MATCH",
  sa: "SHORT"
};

/* Which module each match-the-pairs set belongs to. */
export const MATCH_TOPICS = [6, 4, 2, 1, 7];

export const STORAGE_KEY = "iot-drill-room.v1";
