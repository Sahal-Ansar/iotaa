# Drill Room

Active-recall drills for IIIT Sri City courses, in one app. Every question is
drawn from the course material — nothing outside the syllabus.

| Course | Scope | MCQ | Blanks | T/F | Match | Short |
|---|---|---:|---:|---:|---:|---:|
| **IoT** — Internet of Things & Applications (Dr U Somalatha) | All modules | 180 | 70 | 30 | 5 | 46 |
| **NLP** — Natural Language Processing (Shaik Mohammad Rafi B) | Units 1–3 | 164 | 60 | 30 | 5 | 42 |

| **FDFED** — Redux Toolkit todo app (5 source files) | App.jsx, main.jsx, store.js, todoSlice.js, index.css | code rounds — see below |||||

Switch courses from the sidebar. Progress, accuracy and the module filter are kept
**separately per course** in `localStorage`, so a reload — or a switch and back —
doesn't lose the session.

## Modes

| Mode | How it grades |
|---|---|
| Multiple choice | Instant, with an explanation for every answer |
| Fill the blank | Fuzzy text match, plus a "count as correct" override |
| True or false | Instant, with the correction when the statement is false |
| Match the pairs | Per-row; wrong rows show the right letter |
| Short answer | Self-marked against a model answer |
| Mixed drill | The three auto-graded types, shuffled together |

Finishing a set offers **Retry N missed**, which rebuilds the queue from only the
questions you got wrong, and shows a per-module accuracy breakdown.

Question IDs (`MCQ 047`, `BLANK 12`) match the printed question banks, so anything
you keep missing is easy to look up.

## FDFED code rounds

Open **`/fdfed`** to go straight to the FDFED course with the course switcher
hidden (that's the link to share). The goal is to know the five files by heart;
`data.json` is not drilled.

| Round | What you do |
|---|---|
| Study the files | Read each file with a note on every line; *Cover mode* blurs the code so you recite and tap to check |
| Line fill | One line is missing in context — type it |
| Token blanks | Words are blanked inside the code (Easy → Every word) |
| Fix the bug | One line is wrong — tap it, then type the fix (43 bugs, including the real one in the source `App.jsx`) |
| Line order | Shuffled lines, tap them back into order |
| First letters | Each line shows only first letters — rebuild it |
| Chain recall | Type a file top to bottom, one line per Enter |
| Write from memory | Blank textarea, then a line-by-line diff |
| Concept quiz | Why each line exists + "which file is this line from?" |
| Mixed rounds | Line fill, blanks, bugs and quiz shuffled |

Grading ignores spacing and quote style, and a trailing `;` or `,` is optional;
every other token has to match.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Deploy to Vercel

**Option A — from your terminal**

```bash
npm install -g vercel     # once
vercel login              # opens your browser
vercel --prod             # accept the defaults
```

Vercel detects Vite automatically: build command `npm run build`, output directory
`dist`. No configuration file needed.

**Option B — from GitHub (auto-deploy on every push)**

```bash
git add -A
git commit -m "Add NLP course"
git push
```

Then on vercel.com: **Add New → Project → Import** the repo → **Deploy**. Every
later push to `main` redeploys on its own.

## Keyboard

| Key | Does |
|---|---|
| `1`–`4` or `a`–`d` | Pick an option |
| `T` / `F` | Pick true or false |
| `Enter` | Confirm, then again to advance |

## Layout

```
src/
  App.jsx                 screen composition + keyboard handling
  lib/courses.js          the course registry — add a course here
  lib/useDrill.js         all drill state (queue, scoring, per-course persistence)
  lib/grading.js          answer normalisation and fuzzy blank matching
  lib/storage.js          localStorage, guarded for private windows
  components/RichText.jsx parses the banks' inline tags into real elements
  components/*Card.jsx    one component per question type
  data/iot.json           IoT question bank
  data/nlp.json           NLP question bank
```

## Adding another course

1. Drop a `data/<key>.json` bank in the same shape as the existing two
   (`topics`, `mcq`, `fitb`, `tf`, `match`, `sa`).
2. Add an entry to `COURSES` in `src/lib/courses.js`.

Nothing else needs to change — the sidebar, counts, module chips and scoring all
read from that registry.

## Stack

React 18 + Vite. No UI framework, no CSS framework — one stylesheet with CSS custom
properties driving light and dark themes.
