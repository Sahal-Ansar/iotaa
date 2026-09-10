# Drill Room

Active-recall drills for two IIIT Sri City courses, in one app. Every question is
drawn from the lecture decks — nothing outside the syllabus.

| Course | Scope | MCQ | Blanks | T/F | Match | Short |
|---|---|---:|---:|---:|---:|---:|
| **IoT** — Internet of Things & Applications (Dr U Somalatha) | All modules | 180 | 70 | 30 | 5 | 46 |
| **NLP** — Natural Language Processing (Shaik Mohammad Rafi B) | Units 1–3 | 164 | 60 | 30 | 5 | 42 |

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
