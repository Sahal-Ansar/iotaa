# IoT Drill Room

An active-recall drill for the **Internet of Things & Applications** course
(IIIT Sri City, Dr U Somalatha). Every question is drawn from the lecture decks —
nothing outside the syllabus.

| Mode | Count | How it grades |
|---|---|---|
| Multiple choice | 180 | Instant, with the explanation for every answer |
| Fill the blank | 70 | Fuzzy text match, plus a "count as correct" override |
| True or false | 30 | Instant, with the correction when the statement is false |
| Match the pairs | 5 sets | Per-row, wrong rows show the right letter |
| Short answer | 46 | Self-marked against a model answer |
| Mixed drill | 280 | The three auto-graded types, shuffled together |

Progress and per-module accuracy are kept in `localStorage`, so a refresh
doesn't lose the session. Finishing a set offers **Retry N missed**, which
rebuilds the queue from only the questions you got wrong.

Question IDs (`MCQ 047`, `BLANK 12`) match the printed question bank, so
anything you keep missing is easy to look up.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Deploy to Vercel

**Option A — from your terminal (fastest)**

```bash
npm install -g vercel     # once
vercel login              # opens your browser
vercel --prod             # accept the defaults
```

Vercel detects Vite automatically: build command `npm run build`,
output directory `dist`. No configuration file needed.

**Option B — from GitHub (gets you auto-deploy on every push)**

```bash
git init
git add -A
git commit -m "IoT Drill Room"
git branch -M main
git remote add origin https://github.com/<you>/iot-drill-room.git
git push -u origin main
```

Then on vercel.com: **Add New → Project → Import** that repo → **Deploy**.
Every later push to `main` redeploys on its own.

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
  lib/useDrill.js         all drill state (queue, scoring, persistence)
  lib/grading.js          answer normalisation and fuzzy blank matching
  lib/storage.js          localStorage, guarded for private windows
  components/RichText.jsx parses the bank's inline tags into real elements
  components/*Card.jsx    one component per question type
  data/questions.json     the question bank
```

## Stack

React 18 + Vite. No UI framework, no CSS framework — one stylesheet with
CSS custom properties driving light and dark themes.
