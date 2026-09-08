/**
 * Normalise a typed answer so that casing, punctuation and filler words
 * don't cost the student a mark.
 */
export function normalise(value) {
  return String(value)
    .toLowerCase()
    .replace(/[‐-―]/g, "-")
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .replace(/\b(the|a|an|of|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the typed answer matches any accepted form. */
export function isBlankCorrect(typed, accepted) {
  const value = normalise(typed);
  if (!value) return false;
  return accepted.some((candidate) => {
    const target = normalise(candidate);
    if (target === value) return true;
    // allow a longer answer that starts with the key term, and vice versa
    return (
      target.length > 4 &&
      value.length > 4 &&
      (target.startsWith(value) || value.startsWith(target))
    );
  });
}

export function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
