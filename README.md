# SÖZÜM SÖZ ("My word is my bond") — Samsung Innovation Campus Hackathon

> This project was prepared for the **Samsung Innovation Campus Generative AI Hackathon**.

## ACCESS ALL PROJECT FILES FROM THIS LINK

https://drive.google.com/drive/folders/1wA-KB87F391dXMPi51C4j-AUOBaqv3t3?usp=sharing

## Deliverables

- **Report (PDF):** [`Hackathon Report.pdf`](./Hackathon%20Report.pdf) — SÖZÜM SÖZ hackathon report (Group 8)
- **Demo flow:** [`docs/DEMO-SCRIPT.md`](./docs/DEMO-SCRIPT.md)
- **Turkish version:** https://github.com/Caagan/Sozum-Soz-Uygulamasi-TR (report + presentation in Turkish)

## Purpose

Technology keeps evolving and is a part of our lives. In the technology age we cannot solve
technology addiction by **banning or restricting everything**. Phones, social media, games and
streaming services are now a natural part of our lives; the real issue is the **control and
awareness** we have lost. SÖZÜM SÖZ starts exactly there: instead of blaming digital usage, it
gives the user the chance to *see* their own behavior and helps them build the right habit by
**encouraging and rewarding** it.

The idea is simple and clear: before you enter an app, you state **"how many minutes you
promise to stay"**. When you keep your word you earn points, multiply them with streaks, and
get rewarded from the reward catalog and the monthly draw. A **generative AI coach** turns the
day's and week's records into "pattern → trigger → small experiment" in a non-judgmental tone;
it never scolds you — it only helps you notice and offers concrete support with micro-breaks.
Data stays only on your device; no identity data ever reaches the API.

## What's inside?

- **Time promise:** set a target time on every launch; keep your word (+3, streak bonus) or
  overshoot (empathetic alert, -5, streak reset) — "promising" becomes a meaningful behavior.
- **Generative AI at every stage:** daily reflection, weekly summary and multi-turn chat are
  delivered by a generative AI coach at the core of the app; every response carries an **AI
  stamp** and a "not medical" disclaimer; crisis signals route to the 115 / 112 help lines.
- **Weekly score "face" (notification panel):** according to your performance, a permanent
  **😀 good · 😐 average · 🙁 bad** emoji appears in the phone's notification/status bar; the
  same is mirrored in the SÖZÜM SÖZ background notification — "how am I doing this week?" is
  visible at a glance.
- **Gamification:** points, streaks, daily reward (3 promises), weekly challenges, reward
  catalog, monthly draw.
- **Phone mockup:** the prototype runs inside a phone frame; in fast-demo mode (1 sec ≈ 1 min)
  the whole 5-minute flow is watched in seconds.
- **Privacy centered:** KVKK m.10 privacy notice + explicit-consent lock, plus data download
  (JSON), permanent deletion and consent withdrawal in Settings (KVKK m.11 / m.7). Data lives
  in `localStorage`.

## Run

Works one of three ways (no server required; all data is stored in `localStorage`):

1. **Direct (double-click):** open `src/index.html` in the browser. No dependencies; the full
   demo opens.
2. **Windows local server:** `tools/START.bat` (no install required, runs with PowerShell).
3. **Python:** `python -m http.server 8000 --directory src` → `http://localhost:8000`

> **Live-AI note (CORS):** `fetch()`-based live AI calls (Settings → enter a key) only work
> from an `http://` origin (method 2 or 3) due to browser policies; if you open `src/index.html`
> as a file (double-click), the template mode runs — the demo works end-to-end even without a key.

## Live AI usage (optional)

By default the "Reflection (AI)" tab uses a template-producing fallback (the demo works fully
without a key). For a real model fill in these fields in Settings:

- Live AI: on
- Provider: **OpenAI** (default) or **Google Gemini** (selecting it auto-sets URL/model; you
  can type a custom/fine-tuned model name in the 'Model' field)
- API base URL: `https://api.openai.com/v1` (any OpenAI-compatible service works)
- Model: e.g. `gpt-4o-mini` or `gemini-3.6-flash`
- API key: `sk-...` or `AIza...`

Keys are stored only in the browser; only an anonymous session summary (prompt) goes to the API.

## Test

Behavior tests run end-to-end with jsdom (Node.js required):

    npm install        # installs the jsdom dependency (once)
    npm test           # 69 + 4 + 5 + 9 behavior tests — all should be OK
    npm run build:check  # src/ → dist/ single file + verify
    npm run serve      # local server via python (alternative)

With fast demo on, 1 second ≈ 1 minute; a 5-minute time promise then expires within seconds
and the notification/points flow can be watched end to end.

- Enter an app → make a time promise (2/5/10/15/... min)
- When time runs out the AI coach generates an empathetic, guilt-free notification based on
  the user's context (time, overshoot, streak) and suggests a concrete micro-break (rest your
  eyes, drink water... "Start break" → 20-second countdown → +5 points)
- "Keep my word and close" = +3 points, streak +1
- "Switch to another app" or closing and immediately opening another app = -5 points, streak
  reset
- Streak bonuses: 3/7/14/30 promises → +10/+25/+60/+150
- Daily promise: keep 3 promises → +20 (claimed from the Status tab)
- Charts: today vs same day last week, last-7-days usage, weekly (4 weeks) comparison, category
  distribution (donut) and most-used apps
- Chat (multi-turn AI coach): a coach that remembers the conversation; template responses by
  default, enter a key in Settings for a live model
- Weekly score emoji: while the app is "running in the background" the phone notification
  panel shows 😀 (good) / 😐 (average) / 🙁 (bad); can be shown with the demo buttons
  (Good/Average/Bad/Auto) in the Phone tab
- Reflection (AI): daily reflection + weekly summary; "Show the prompt used" displays the
  prompt that goes into the report along with the design rationale
- Weekly Challenges tab: 5 challenges (screen < 10 h, 7 promises, 5 breaks, 3 different apps,
  fewer than 3 overshoots). Join a challenge → earn the points once the condition is met;
  progress counts from the last 7 days

## Privacy & ethics

- The first tap on the **SÖZÜM SÖZ icon** in the phone shows a **full KVKK m.10 privacy notice +
  explicit consent** screen: accept → the app opens; decline → the app will not run. The choice
  is remembered.
- **Data rights (Settings → Data Rights):**
  - **Download my data (JSON)** — right of access (KVKK m.11): exports your data.
  - **Delete my data** — right of erasure (KVKK m.11): permanently deletes all data (including
    explicit consent) from the device, locks the app, and the consent is asked again on next open.
  - **Withdraw consent** — KVKK m.7: withdraws explicit consent, SÖZÜM SÖZ becomes locked.
  - **Reset demo** — clears the demo data (not a substitute for permanent deletion).
- Data is kept only in `localStorage` (browser); only an anonymous session summary and the last
  chat messages go to the API (name/photo/contact are never collected).
- **Crisis guard:** if the chat detects suicide/self-harm/severe hopelessness signals, the model
  does not diagnose; the user is routed to the 115 help line and 112.
- **AI stamp:** every AI output carries "this (content/response) was generated by an
  artificial intelligence model" and an "AI" badge in chat; outputs carry the "for awareness
  purposes, not medical" disclaimer.

## Files / directory tree (architecture build)

```
├── src/                    # source code (single source of truth)
│   ├── index.html          # UI + phone mockup
│   ├── css/styles.css      # styles/aesthetics
│   └── js/{data,ai,app}.js # data · AI · engine/presentation layers
├── tests/                  # jsdom behavior tests (npm test / run-all.cmd)
├── tools/                  # single-file builder + verifier + local server
├── docs/                   # ARCHITECTURE.md + DEMO-SCRIPT.md
├── dist/SOZUM-SOZ-SINGLEFILE.html   # generated single file (presentation artifact)
├── package.json            # npm test / build / serve commands
├── Hackathon Report.pdf    # hackathon report (English, PDF)
└── LICENSE  ·  .gitignore
```

## Notes

- **Run:** open `src/index.html` in the browser or use `tools/START.bat`
- **Test:** `npm test` (69 + 4 + 5 + 9 behavior tests) — on Windows also `tests\run-all.cmd`
- **Build & verify single file:** `npm run build:check` (`node tools/build-standalone.js ; node tools/standalone-check.js`)
- **Architecture:** `docs/ARCHITECTURE.md` · **Presentation flow:** `docs/DEMO-SCRIPT.md`
- **Presentation:** `dist/SOZUM-SOZ-SINGLEFILE.html` is a single file; it can be opened and
  presented directly in the browser.
- **License:** Apache-2.0 — see `LICENSE`.
- All data is stored only in the browser (`localStorage`); no identity data ever goes to the API.