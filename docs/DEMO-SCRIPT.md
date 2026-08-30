# Demo Script (~5 min) — SÖZÜM SÖZ

Goal: show the jury the "time promise → tracking → points/streak → ethics → AI → data rights"
chain in a single flow. Open `dist/SOZUM-SOZ-SINGLEFILE.html` in the browser (ideally in two
tabs: one for the app, one for GitHub) and narrate along.

| Time | Narrate | What to do on screen |
| --- | --- | --- |
| 0:00–0:30 | Problem: persistent app usage; the "make yourself a promise" idea | Show the home screen: phone mockup, the "time promise" concept |
| 0:30–1:15 | Time-promise flow | Tap a social-network tile → pick a duration (e.g. 5 min) → "Promise". Fast demo: 1 sec ≈ 1 min |
| 1:15–1:45 | Time running out + AI coach notification | Let the timer flow; when it expires show the empathetic notification + micro-break suggestion (20-sec countdown, +5 points) |
| 1:45–2:15 | Ending the promise → points/streak flow | "Keep my word and close" → +3, streak +1; show the POINTS/STREAK increase in the top bar. Recent activity and the weekly score emoji |
| 2:15–2:45 | Daily reflection (AI) | "Reflection (AI)" tab → "Generate Reflection". Point out the **AI stamp + "not medical"** in the output; use "show the prompt" to explain the prompt design (zero-shot/few-shot/step-by-step) |
| 2:45–3:15 | Chat coach + crisis guard | In the chat write e.g. a message with "suicide..."/hopelessness → the response routes to 115 / 112 |
| 3:15–3:45 | Privacy: KVKK m.10 + explicit consent | The **SÖZÜM SÖZ icon** in the phone: the notice appears on the first tap; show that tapping "I do not accept" keeps the app locked |
| 3:45–4:15 | Data rights (KVKK m.7/m.11) | Settings → Data Rights: "Download my data" (extracts JSON), "Delete my data" (app becomes locked), "Withdraw consent" |
| 4:15–4:45 | Tech + architecture | Repo tree (on GitHub) + no unnecessary dependencies + tests (`tests/run-all.cmd`, 69+ tests) |
| 4:45–5:00 | Closing | Finish with a single sentence: problem → solution → "non-judgmental, non-medical, privacy-centered" |

## Tips

- Run the demo in **fast mode** (default: 1 sec ≈ 1 min); a 5-minute promise ends within seconds.
- If you have a live AI key, enable it from Settings; otherwise the template fallback is enough —
  sell this as a feature: "works end-to-end even without a key".
- For "why these techniques?" you have a ready answer in the report (`Hackathon Report.pdf`, §3).