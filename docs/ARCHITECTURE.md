# Architecture — SÖZÜM SÖZ

SÖZÜM SÖZ is a fully client-side web prototype: it does not depend on a server, all user data
lives in `localStorage`, and the AI only processes anonymous summaries. It uses a layered yet
lean and clear architecture.

## Layers

| Layer | File | Responsibility |
| --- | --- | --- |
| Presentation / UI | `src/index.html`, `src/css/styles.css`, `src/js/app.js` (render + events) | Interface, phone-mockup screen, notification stack, all screen flows |
| Application engine | `src/js/app.js` | State management, time-promise engine, points/streak, challenges, draw, rewards, feed, KVKK flow, screen routing |
| Data | `src/js/data.js` | Static content: app catalog, reward catalog, draw prizes, weekly challenges, svg logo generators |
| AI layer | `src/js/ai.js` | Prompt design (system role, few-shot, step-by-step), provider call (OpenAI/Gemini), template fallback, crisis guard, AI stamp generator |
| Persistent data | browser `localStorage` | Key-value persistence of state (in-app `state` + `save()`) |
| Build / test | `tools/`, `tests/` | `build-standalone.js` → `dist/` single file; jsdom-based behavior tests |

## Data flow (session example)

```
index.html ──> app.js (IIFE bootstrap)
   ├─ load state from localStorage → renderHome()
   ├─ tap a tile → openPromiseDialog()  (the "make a promise" screen)
   │    └─ a duration is chosen → enterApp(): start the timer (1 sec ≈ 1 min demo)
   ├─ time runs out → coachBuild() → notification (micro-break + points) → finishSession()
   │    └─ feed/stats/streak/challenge update → save()
   ├─ Reflection tab → ai.js: buildDaily/buildWeekly → API or fallback → output (AI stamp + "not medical" notice)
   └─ Chat → ai.js: chatSystem + crisis guard → history (last 20) + response
```

## File / directory tree

```
`Sozum-Soz-Uygulamasi-EN/`
├── src/                     # single source of truth
│   ├── index.html           # page skeleton + tabs + phone mockup
│   ├── css/styles.css       # all styles/aesthetics
│   └── js/
│       ├── data.js          # static data catalog
│       ├── ai.js            # AI layer
│       └── app.js           # app engine + presentation
├── tests/                   # jsdom end-to-end behavior tests
│   ├── test-app.js          # 69 tests (core flow, KVKK, challenges, sheet, rewards…)
│   ├── test-offtopic.js     # AI off-topic rejection
│   ├── test-ai-stamp.js     # AI stamp / "not medical" disclaimer
│   ├── test-kvkk-full.js    # privacy-notice section headings + data rights
│   └── run-all.cmd          # runs everything in sequence (Windows)
├── tools/
│   ├── build-standalone.js  # src/ → dist/ single-file builder
│   ├── standalone-check.js  # verifies the generated single file in jsdom
│   ├── START.bat            # starts the local server and opens the browser
│   └── server.ps1           # dependency-free mini static server
├── docs/
│   ├── ARCHITECTURE.md      # this document
│   └── DEMO-SCRIPT.md       # ~5-minute jury presentation flow
├── dist/                    # generated single file (presentation artifact)
│   └── SOZUM-SOZ-SINGLEFILE.html
├── package.json             # npm test / npm run build:check / npm run serve
├── README.md
├── Hackathon Report.pdf    # hackathon report (English, PDF)
├── LICENSE                  # Apache-2.0
└── .gitignore
```

## Design decisions

1. **Works without dependencies:** the app runs end-to-end even without an API key (template
   AI). This even rescues the jury demo in a "no internet/API" scenario.
2. **Single-file `dist/`:** the presentation can be done from a single HTML file; `src/` is
   kept separate for a better sense of scale. Built by `tools/build-standalone.js`.
3. **Privacy centered:** no layer knows the user's identity; only numeric summaries go to the
   API. The KVKK flow lives inside the engine, and so does the data-rights screen.
4. **Testability:** real DOM behavior is tested with jsdom + `runScripts:"dangerously"`
   (test-app alone has 69 checks). This ensures a new feature does not break existing flows.
5. **AI safety:** a single crisis guard (`ai.js`) is shared by both the live model and the
   fallback path; every output automatically gets an AI stamp and the "not medical" disclaimer.

## Build & verify

```
npm install                # jsdom dev-dependency (once)
npm test                   # 69 + 4 + 5 + 9 behavior tests (0 FAIL expected)
npm run build:check        # src/ → dist/ single file + verify in jsdom
npm run serve              # local server via python (src/ root)
```