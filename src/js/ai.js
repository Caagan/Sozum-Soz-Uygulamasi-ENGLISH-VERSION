// ---------- Generative AI layer: prompt design + API + fallback ----------

const AI = {

  systemPrompt() {
    return [
      "You are 'SÖZÜM SÖZ' (\"my word is my bond\"), a digital well-being coach. Your task is to help the user reflect on their screen-usage records in a non-judgmental, non-medical tone.",
      "Rules:",
      "1) Do not use medical or stigmatizing words such as 'addict', 'patient', 'treatment', 'disorder'. Do not diagnose.",
      "2) Do not blame the person; focus on behavior patterns and contexts.",
      "3) Respond in at most 6-8 short bullet points: Pattern -> Possible trigger -> Small improvement suggestion.",
      "4) Base every number only on the data provided; if data is missing, do not assert exact numbers.",
      "5) Suggestions must be concrete, accessible and take the form of short (1-2 minute) 'experiments'; do not pressure the user.",
      "6) Always respond in English.",
      "7) End the output with the line: 'This information is for awareness purposes and is not a medical diagnosis or treatment recommendation.'",
      "8) If you see a crisis signal (suicide, self-harm, severe hopelessness, 'I can't go on'), do not diagnose; calmly and without judgment direct to free support lines: Yeşilay Counseling Line 115, and 112 for emergencies.",
      "9) VERIFICATION (before sending): is every number I use present in the data? If unsure, do not invent numbers; say 'this is not in my records'. Is there any medical, blaming or punishing wording? Are the format rules followed (dash '-' bullets, last-line disclaimer)?"
    ].join("\n");
  },

  // ---------- crisis guard ----------
  crisisPattern: /kill myself|want to (die|end)|end my life|end it all|harm myself|hurt myself|take my own life|self[- ]harm|suicid(e|al)?|no reason to live|no point in living|can('t|not| no longer) (go on|carry on|take it)|give up( on (everything|life))?|hopeless|no one (understands|cares about|wants|needs) me|kendime zarar|kendime kıy|kendimi öldür|intihar|ölmek istiyorum|yaşamak istemiyorum/i,

  isCrisis(text) {
    return !!String(text || "").match(AI.crisisPattern);
  },

  crisisReply() {
    return [
      "You wrote something important, and I take it seriously. SÖZÜM SÖZ does not diagnose and does not provide medical support; but the right step is not to keep these feelings to yourself.",
      "",
      "Please talk to a trusted adult right away (a parent, guardian, teacher or school counselor) or call a free support line:",
      "- Yeşilay Counseling Line: 115",
      "- Emergency / immediate risk to safety: 112",
      "",
      "This information is for awareness purposes and is not a medical diagnosis or treatment recommendation."
    ].join("\n");
  },

  // ---------- medical gate (we do not answer medical questions, we refer to a doctor) ----------
  medicalPattern: /(ağr(ı|ım)|sancı|mide|ateş|baş dönmesi|tansiyon|şeker|ilaç|reçete|ameliyat|kanama|doktor)|(pain|ache(s|d)?|stomach|fever|headache|migraine|nausea|dizzy|numbness|tingling|palpitation|chest|heart attack|blood pressure|diabetes|medication|medicine|pill|prescription|surgery|operation|wound|injury|bleeding|vomit|rash|itch|allerg(y|ic)?|doctor|hospital|pharmacy|dose|overdose|infection|virus)/i,

  isMedical(text) {
    return !!String(text || "").match(AI.medicalPattern);
  },

  medicalReply() {
    return [
      "This looks like a medical question; SÖZÜM SÖZ does not make diagnoses and cannot give medical advice.",
      "The right step for health questions is to consult a doctor or a healthcare provider.",
      "",
      "Instead, I can support you on digital well-being: we can talk about screen time, duration promises, breaks, and night-time usage."
    ].join("\n");
  },

  // ---------- off-topic detection, split into groups ----------
  wellbeingContext: /(phone|screen|app|scroll|feed|promise|süre sözü|break|mola|addict|notification|session|habit|overuse|social media|night usage|gaming|digital|dijital|ekran|bildirim|alışkanlık|kaydırma|gece kullanım)/i,

  offTopicGroups: [
    { name: "finance", re: /forex|dollar|euro|currency|exchange rate|stock market|share price|bitcoin|crypto|cryptocurrency|interest rate|inflation|bank|invest|salary|tax|faiz|enflasyon|döviz|borsa|kripto/i },
    { name: "news", re: /election|politics|government|war|earthquake|news headline|president|seçim|siyaset|hükümet|savaş|deprem|haber/i },
    { name: "sports", re: /match (result|score)|score today|league table|championship|champion|goal|football result|maç sonucu|takım|lig|şampiyon|gol|skor/i },
    { name: "entertainment", re: /celebrity|movie (review|plot|trailer)|song lyrics|actor|pop star|film|dizi|müzik|ünlü|magazin/i },
    { name: "knowledge", re: /math|equation|physics|chemistry|history question|geography|what (does|is|in)|translate|homework|definition|english word|matematik|denklem|fizik|kimya/i },
    { name: "lifestyle", re: /weather|recipe|cooking|hotel|travel tip|hava durumu|tarif|otel|gezi öner/i }
  ],

  detectOffTopic(q) {
    const lower = String(q || "").toLowerCase();
    if (AI.wellbeingContext.test(lower)) return null;
    for (const g of AI.offTopicGroups) {
      if (lower.match(g.re)) return g.name;
    }
    return null;
  },

  offTopicReply(group) {
    const labels = {
      finance: "Currency, stock and market details are not my field",
      news: "Current news and politics are not my field",
      sports: "Sports results and scores are not my field",
      entertainment: "I don't recommend movies, music or game cheats",
      knowledge: "General knowledge and homework topics are not my field",
      lifestyle: "Recipes, weather and lifestyle advice are outside my field"
    };
    return [
      (labels[group] || "This topic is not my field") + "; I am a digital well-being coach.",
      "Instead, I can help with: screen time, duration promises, break suggestions, night-time usage, and the habit of jumping between apps.",
      "Which screen habit is pushing you the most right now?"
    ].join("\n");
  },

  hourOf(ts) {
    return new Date(ts).getHours();
  },

  periodOf(h) {
    if (h >= 6 && h < 12) return "morning";
    if (h >= 12 && h < 18) return "afternoon";
    if (h >= 18 && h < 22) return "evening";
    return "night";
  },

  aggregate(sessions) {
    const byCategory = {};
    const byApp = {};
    const periodCounts = {};
    let usedMin = 0, promisedMin = 0, kept = 0, brokenExceed = 0, brokenHop = 0, overshoot = 0;
    const overshootSum = { total: 0, n: 0 };
    sessions.forEach(s => {
      usedMin += s.usedMin;
      promisedMin += s.promisedMin;
      byCategory[s.category] = (byCategory[s.category] || 0) + s.usedMin;
      if (!byApp[s.appId]) byApp[s.appId] = { name: s.appName, used: 0, exceed: 0, kept: 0 };
      byApp[s.appId].used += s.usedMin;
      if (s.result === "kept") { kept++; byApp[s.appId].kept++; }
      if (s.result === "broken_exceed") { brokenExceed++; byApp[s.appId].exceed++; }
      if (s.result === "broken_hop") brokenHop++;
      if (s.usedMin > s.promisedMin) {
        overshoot++;
        overshootSum.total += (s.usedMin - s.promisedMin);
        overshootSum.n++;
      }
      const p = AI.periodOf(AI.hourOf(s.ts));
      periodCounts[p] = (periodCounts[p] || 0) + (s.usedMin > s.promisedMin ? 1 : 0);
    });
    const topApps = Object.keys(byApp)
      .map(k => ({ name: byApp[k].name, used: byApp[k].used, exceed: byApp[k].exceed }))
      .sort((a, b) => b.used - a.used);
    const categories = Object.keys(byCategory)
      .map(k => ({ name: k, used: byCategory[k] }))
      .sort((a, b) => b.used - a.used);
    return {
      total: sessions.length,
      usedMin, promisedMin,
      kept, brokenExceed, brokenHop, overshoot,
      avgOvershootMin: overshootSum.n ? Math.round(overshootSum.total / overshootSum.n) : 0,
      avgUsedMin: sessions.length ? Math.round(usedMin / sessions.length) : 0,
      topApps, categories, periodCounts
    };
  },

  serialized(sessions) {
    return sessions.slice(0, 14).map(s => ({
      app: s.appName,
      targetMinutes: s.promisedMin,
      actualMinutes: s.usedMin,
      result: s.result,
      closeHour: AI.hourOf(s.ts)
    }));
  },

  buildDaily(sessions) {
    const agg = AI.aggregate(sessions);
    return [
      "===== SECTION 1: COMMAND (your task) =====",
      "Turn the user's screen-usage record for today into a reflection without judgment, without making a diagnosis, and taking numbers ONLY from the DATA section below.",
      "",
      "===== SECTION 2: DATA (numbers come only from here) =====",
      "The user's screen-usage record for today (JSON):",
      JSON.stringify({
        totalSessions: agg.total,
        totalMinutes: agg.usedMin,
        promisesKept: agg.kept,
        promisesBroken: agg.brokenExceed + agg.brokenHop
      }, null, 2),
      "",
      "Sessions:",
      AI.serialized(sessions).length
        ? JSON.stringify(AI.serialized(sessions), null, 2)
        : "There are no session records for today; say so.",
      "",
      "===== SECTION 3: EXAMPLE 1 — A NORMAL DAY (most promises kept) =====",
      "\"Today you spent ~85 minutes across 4 apps and kept 2 promises — a good start. The biggest overshoot is on TikTok (2 times, ~7 minutes each). An overshoot tendency appears after 21:00; automatic scrolling may be triggered during fatigue. Small experiment: before opening TikTok, write your 'reason for entering' for 1 minute. Second experiment: put the phone in another room at 23:00.\"",
      "",
      "===== SECTION 4: EXAMPLE 2 — A HARD DAY (several promises broken, soft and encouraging tone) =====",
      "\"Today was hard, and noticing it matters more than hiding it: 4 of 5 sessions exceeded the target, and in total you went ~40 minutes over your target. This is not a failure; it is a repeating pattern. Overshoots concentrate in the afternoon and late night. Your small experiments: take 30 seconds to breathe before mid-day app switches; after 23:00 leave the phone in another room.\"",
      "",
      "===== SECTION 5: VERIFY (ask yourself before sending) =====",
      "1) Is every number I use present in the DATA in SECTION 2? If not, do not invent numbers; feel free to say 'not in my records'.",
      "2) Is there any medical, blaming or punishing language in any bullet?",
      "3) Does every bullet start with '-' and is the last line the legal disclaimer?",
      "",
      "Now respond for this user's data, following the structure of EXAMPLES 1/2 and all the rules."
    ].join("\n");
  },

  buildWeekly(sessions) {
    const agg = AI.aggregate(sessions);
    const catLines = agg.categories.length
      ? agg.categories.map(c => "* " + (CATEGORY_LABELS[c.name] || c.name) + ": " + c.used + " min").join("\n")
      : "* No data.";
    const appLines = agg.topApps.length
      ? agg.topApps.slice(0, 3).map(a => "* " + a.name + ": " + a.used + " min (" + a.exceed + " overshoots)").join("\n")
      : "* No data.";
    return [
      "===== SECTION 1: COMMAND (your task) =====",
      "From the user's screen-usage record of the last 7 days, produce a non-judgmental weekly reflection, taking numbers only from the DATA below.",
      "",
      "===== SECTION 2: DATA (numbers come only from here) =====",
      "The user's screen usage statistics for the last 7 days:",
      JSON.stringify({
        totalSessions: agg.total,
        totalMinutes: agg.usedMin,
        promisesKept: agg.kept,
        promisesBrokenOvershoot: agg.brokenExceed,
        promisesBrokenHop: agg.brokenHop,
        averageOvershootMin: agg.avgOvershootMin,
        mostUsed: agg.topApps.slice(0, 3).map(a => a.name),
        categoryBreakdownMin: Object.fromEntries(agg.categories.map(c => [c.name, c.used]))
      }, null, 2),
      "",
      "Category breakdown:",
      catLines,
      "Top 3 apps:",
      appLines,
      "",
      "===== SECTION 3: STEPS (never change the order) =====",
      "STEP 1: Summarize the overall picture of the week in 1-2 non-judgmental sentences. Do not diagnose.",
      "STEP 2: Pick the 2 strongest patterns; for each, write a short bullet using 'pattern -> possible trigger -> small experiment'.",
      "STEP 3: Give 2 concrete and flexible boundary/routine suggestions for next week (do not set rigid targets such as '1 hour per day').",
      "STEP 4: Write an encouraging but realistic closing sentence and add the legal disclaimer line.",
      "",
      "===== SECTION 4: VERIFY (ask yourself before sending) =====",
      "1) Are all numbers from the DATA? Don't invent what I don't know.",
      "2) Is there any medical or blaming language?",
      "3) Is the step order in SECTION 3 preserved and is the last line the legal disclaimer?",
      "",
      "Now respond with the weekly reflection."
    ].join("\n");
  },

  fallback(kind, agg) {
    if (!agg || agg.total === 0) {
      return "Not enough data yet. Make a duration promise on an app and close the session; then come back here and generate again.";
    }
    const top = agg.topApps[0];
    const exApps = agg.topApps.filter(a => a.exceed > 0);
    const periodNames = { morning: "in the morning", afternoon: "in the afternoon", evening: "in the evening", night: "at night" };
    const worstPeriod = Object.keys(agg.periodCounts)
      .map(p => ({ p, n: agg.periodCounts[p] }))
      .sort((a, b) => b.n - a.n)[0];
    const periodStr = worstPeriod && worstPeriod.n > 0
      ? "Your overshoots occur most often " + periodNames[worstPeriod.p] + "."
      : "Your overshoots are spread evenly through the day.";
    const exStr = exApps.length
      ? "Apps where you exceeded the target: " + exApps.slice(0, 2).map(a => a.name).join(" and ") + " (" + exApps[0].exceed + " times)."
      : "No overshoots in this period — nice discipline.";
    if (kind === "daily") {
      return [
        "Today you spent ~" + agg.usedMin + " minutes across " + agg.total + " sessions and kept " + agg.kept + " promises. A good start.",
        "",
        "Pattern: " + top.name + " is your highest usage (" + top.used + " min). " + exStr,
        periodStr,
        "",
        "Possible triggers: time flows unnoticed in feed-based apps; automatic content recommendations can raise the 'one more minute' urge. Being aware of this makes the first step easier.",
        "",
        "Small experiments (1 week):",
        "1) For 10 seconds before opening " + top.name + ", write 'what I feel / why I am entering'.",
        "2) Say a finish time out loud before the session; when the time is up, turn the phone over and step away for 2 minutes.",
        "",
        "This information is for awareness purposes and is not a medical diagnosis or treatment recommendation."
      ].join("\n");
    }
    return [
      "Weekly overview: " + agg.total + " sessions, ~" + agg.usedMin + " minutes of screen time. " + agg.kept + " promises kept, " + (agg.brokenExceed + agg.brokenHop) + " broken.",
      "",
      "Pattern 1: " + top.name + " takes a large share of the total usage (" + top.used + " min) and carries an overshoot tendency.",
      "Pattern 2: " + periodStr + " Fatigue and late-night transitions can be the threshold where a 'quick look' turns into a long session.",
      "",
      "Small experiments: 1) Turn off all notifications for one day this week. 2) Before opening an app, answer 'how many minutes?' out loud, then open it.",
      "",
      "For next week: instead of a rigid goal like 'zero overshoots', try shortening sessions in the same time slots by 3 minutes each day.",
      "",
      "This information is for awareness purposes and is not a medical diagnosis or treatment recommendation."
    ].join("\n");
  },

  async generate(kind, sessions, cfg) {
    const system = AI.systemPrompt();
    const user = kind === "daily" ? AI.buildDaily(sessions) : AI.buildWeekly(sessions);
    const promptText = "SYSTEM PROMPT:\n" + system + "\n\n\nUSER PROMPT:\n" + user;
    if (cfg.live && cfg.apiKey) {
      try {
        const callCfg = Object.assign({}, cfg, { temperature: 0.5 });
        const text = await AI.callLLM(callCfg, system, user);
        return { text, source: "live", prompt: promptText };
      } catch (err) {
        const fb = AI.fallback(kind, AI.aggregate(sessions));
        return { text: fb, source: "live-error", prompt: promptText, error: err.message };
      }
    }
    await new Promise(r => setTimeout(r, 700));
    return { text: AI.fallback(kind, AI.aggregate(sessions)), source: "template", prompt: promptText };
  },

  async callLLM(cfg, system, user) {
    return AI.requestChat(cfg, [
      { role: "system", content: system },
      { role: "user", content: user }
    ]);
  },

  async requestChat(cfg, messages) {
    if ((cfg.provider || "openai") === "gemini") {
      return AI.requestGemini(cfg, messages);
    }
    const base = (cfg.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
    const res = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + cfg.apiKey
      },
      body: JSON.stringify({
        model: cfg.model || "gpt-4o-mini",
        messages: messages,
        temperature: cfg.temperature !== undefined ? cfg.temperature : 0.7,
        max_tokens: 1500
      })
    });
    if (!res.ok) {
      let detail = res.status;
      try {
        const j = await res.json();
        if (j.error) detail = j.error.message || j.error.code || res.status;
      } catch (e) { /* empty */ }
      throw new Error("API request failed (HTTP " + detail + ").");
    }
    const j = await res.json();
    const text = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!text) throw new Error("The AI returned an empty response.");
    return text.trim();
  },

  async requestGemini(cfg, messages) {
    const base = (cfg.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
    const model = cfg.model || "gemini-3.6-flash";
    const systemParts = [];
    const contents = [];
    (messages || []).forEach(m => {
      if (m.role === "system") { systemParts.push(m.content); }
      else { contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }); }
    });
    const body = { contents, generationConfig: { temperature: cfg.temperature !== undefined ? cfg.temperature : 0.7, maxOutputTokens: 1500 } };
    if (systemParts.length) body.systemInstruction = { parts: systemParts.map(t => ({ text: t })) };
    const res = await fetch(base + "/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(cfg.apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      let detail = res.status;
      try {
        const je = await res.json();
        if (je.error) detail = je.error.message || je.error.code || res.status;
      } catch (e) { /* empty */ }
      throw new Error("Gemini request failed (HTTP " + detail + ").");
    }
    const j = await res.json();
    const parts = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
    const text = parts ? parts.map(p => p.text || "").join("") : "";
    if (!text) throw new Error("The AI returned an empty response.");
    return text.trim();
  },

  coachSystem() {
    return [
      "You are 'SÖZÜM SÖZ', a digital well-being coach. Your task is to produce one short, empathetic notification about the user's session that does not make them feel guilty.",
      "Rules:",
      "1) Do not judge or blame; do not use medical or stigmatizing words such as 'addict', 'patient', 'treatment'.",
      "2) At most 2 sentences; warm and encouraging.",
      "3) Suggest one concrete, immediately doable microbreak (rest your eyes, drink water, stretch your legs, take 20 breaths, etc.).",
      "4) Present the break in points (points): a reasonable range is 10-20.",
      "5) Do not set hard targets or pressure the user; make it an option.",
      "6) Output ONLY as JSON: {\"title\": \"...\", \"body\": \"...\", \"breakOffer\": \"...\", \"points\": <number>}",
      "7) Always answer in English, do not use markdown."
    ].join("\n");
  },

  buildCoach(opts) {
    return [
      "===== SECTION 1: COMMAND =====",
      "Produce one empathetic, non-guilt-inducing notification. The output will be ONLY this JSON schema: {\"title\": \"...\", \"body\": \"...\", \"breakOffer\": \"...\", \"points\": <number>}",
      "",
      "===== SECTION 2: DATA / CONTEXT =====",
      "App: " + opts.appName,
      "Category: " + (CATEGORY_LABELS[opts.category] || opts.category || "unknown"),
      "Hour: " + opts.hour + ":00",
      "Status: " + (opts.type === "overshoot"
        ? "the target was " + opts.promisedMin + " min, " + opts.overMin + " min was exceeded"
        : "closed an app and immediately switched to another one (app hopping)."),
      "User's current streak: " + opts.streak + (opts.streak > 1 ? " promises kept in a row" : ""),
      "",
      "===== SECTION 3: EXAMPLE 1 — OVERSHOOT =====",
      "{\"title\": \"Break time\", \"body\": \"Your 30-minute session stretched a little; that's completely natural.\", \"breakOffer\": \"Would you like to rest your eyes for 20 seconds and drink a glass of water?\", \"points\": 15}",
      "",
      "===== SECTION 4: EXAMPLE 2 — QUICK SWITCH =====",
      "{\"title\": \"Quick switch noticed\", \"body\": \"Closing one app and immediately opening another is more common under stress.\", \"breakOffer\": \"Pause for 10 seconds and ask yourself: what do I really need right now?\", \"points\": 10}",
      "",
      "===== SECTION 5: VERIFY (before sending) =====",
      "1) Do the title, body, breakOffer and points fields exist?",
      "2) Is points within 1-20?",
      "3) Is there any medical or blaming wording?",
      "Adapt the content to this user's context; do not leave the schema."
    ].join("\n");
  },

  fallbackCoach(opts) {
    var title, body, breakOffer, points;
    if (opts.type === "overshoot") {
      title = "You slightly exceeded your target";
      body = (opts.appName || "The session") + " ran " + opts.overMin + " min longer than expected. Noticing it is enough.";
      breakOffer = "A quick break: close your eyes for 20 sec, breathe, drink water.";
      points = 5;
    } else {
      title = "Quick switch noticed";
      body = "You moved on to " + (opts.appName || "a new app") + "; immediately jumping to another splits your attention.";
      breakOffer = "Pause for 10 seconds and ask yourself: what do I really need right now?";
      points = 3;
    }
    return { title: title, body: body, breakOffer: breakOffer, points: points };
  },

  parseCoach(text, opts) {
    var m = String(text).match(/\{[\s\S]*\}/);
    try {
      var obj = m ? JSON.parse(m[0]) : null;
      return {
        title: (obj && obj.title) || "Break time",
        body: (obj && obj.body) || "",
        breakOffer: (obj && obj.breakOffer) || "",
        points: (obj && typeof obj.points === "number") ? obj.points : 5
      };
    } catch (e) {
      return AI.fallbackCoach(opts);
    }
  },

  async generateCoach(opts, cfg) {
    var system = AI.coachSystem();
    var user = AI.buildCoach(opts);
    var promptText = "SYSTEM PROMPT:\n" + system + "\n\n\nUSER PROMPT:\n" + user;
    if (cfg.live && cfg.apiKey) {
      try {
        var callCfg = Object.assign({}, cfg, { temperature: 0.8 });
        var text = await AI.callLLM(callCfg, system, user);
        return { msg: AI.parseCoach(text, opts), source: "live", prompt: promptText };
      } catch (err) {
        return { msg: AI.fallbackCoach(opts), source: "live-error", prompt: promptText, error: err.message };
      }
    }
    await new Promise(function (r) { setTimeout(r, 600); });
    return { msg: AI.fallbackCoach(opts), source: "template", prompt: promptText };
  },

  chatSystem() {
    return [
      "You are 'SÖZÜM SÖZ', a digital well-being coach. You converse with the user back and forth.",
      "Rules:",
      "1) Be non-judgmental, empathetic and encouraging; do not use medical or stigmatizing words such as 'addict', 'patient', 'treatment'; do not diagnose.",
      "2) Limit the response to 6-10 lines; split longer answers into short paragraphs without piling up bullets.",
      "3) Suggestions must be short, concrete 'small experiments'; do not set hard targets or pressure the user.",
      "4) If needed, ask one clear question and continue based on the answer (multi-turn conversation).",
      "5) Base numbers only on the anonymous data context I give you; if there is no data, do not assume.",
      "6) Always respond in English.",
      "7) When you give directive advice, end with: 'This information is for awareness purposes and is not a medical diagnosis or treatment recommendation.'",
      "8) If you see a crisis signal (suicide, self-harm, severe hopelessness) do not diagnose; calmly and without judgment direct to free support lines: Yeşilay Counseling Line 115, and 112 for emergencies.",
      "9) If the question is unrelated to screen usage / digital well-being (currency, food, general news, math, etc.), do not answer it; briefly say it is outside your field and bring the topic back to the user's screen habits.",
      "10) VERIFICATION: before sending, check that the numbers come only from the given context; if unsure, do not invent numbers. If the response contains medical/blaming wording, fix it."
    ].join("\n");
  },

  fallbackChat(agg, q) {
    var lines = [];
    if (AI.isCrisis(q)) return AI.crisisReply();
    if (agg && agg.total > 0) {
      var top = agg.topApps[0];
      lines.push("Your last 7 days: " + agg.total + " sessions, ~" + agg.usedMin + " minutes of screen time; " + agg.kept + " promises kept, " + (agg.brokenExceed + agg.brokenHop) + " broken." + (top ? " " + top.name + " stands out the most (" + top.used + " min)." : ""));
      lines.push("");
    } else {
      lines.push("I don't have enough data yet; but we can start with something small together.");
      lines.push("");
    }
var lower = String(q || "").toLowerCase();
    if (AI.isCrisis(q)) {
      return AI.crisisReply();
    }
    if (AI.isMedical(q)) {
      lines.push(AI.medicalReply());
    } else {
      var off = AI.detectOffTopic(q);
      if (off) {
        lines.push(AI.offTopicReply(off));
      } else if (/break|stress|tired|rest|eye|relax|drained/i.test(lower)) {
        lines.push("A good step. Now close your eyes for 20 seconds, take 3 slow breaths and drink a glass of water.");
        lines.push("While on the app screen, the 'Start break' button gives you a short break and +5 points.");
      } else if (/plan|goal|start|how|tip|suggest|advice|routine|schedule/i.test(lower)) {
        lines.push("Let's start small and flexible:");
        lines.push("1) Make a duration promise for 3 apps today; keep the first one at 10 minutes.");
        lines.push("2) Take a 1-minute breathing break after each promise.");
        lines.push("3) Note the hour when you overshoot the most; tomorrow try to shorten it by 3 minutes.");
        lines.push("If you like, we can set your first promise right now on the Phone tab.");
      } else if (/evening|night|scroll|late|sleep|insomnia|can('t|not)? sleep|bed|unwind/i.test(lower)) {
        lines.push("Late-night sessions usually start with fatigue; automatic scrolling continues unnoticed.");
        lines.push("Small experiment: after 21:00 leave the phone in another room. Which day will you try it first?");
      } else if (/motivation|unwilling|bored|boredom|energy|demotivated/i.test(lower)) {
        lines.push("Low motivation is completely normal; what matters is not forcing yourself but taking one small first step.");
        lines.push("Now divide your phone into three layers: essential (messages), enjoyable (video), escape (feed). Put a 5-minute 'entry promise' on the escape layer today.");
        lines.push("Small experiment: tomorrow morning leave the phone out of reach for 20 minutes and keep breakfast phone-free.");
      } else if (/notification|keep checking|urge to check|phone in (my )?hand|checking habit/i.test(lower)) {
        lines.push("The urge to keep checking comes from how notifications are designed to steer us — not from a lack of discipline.");
        lines.push("Small experiments: 1) Mute app notifications in bulk (keep only personal chats). 2) Keep the phone in one fixed spot at home, not in your pocket.");
      } else if (/work|study|focus|productivity|attention|concentrate|exam|deadline/i.test(lower)) {
        lines.push("The most effective screen for focus is removing the phone from your workspace; a phone you cannot see is missed far less.");
        lines.push("Pomodoro trial: 25 minutes promise (phone in another room), 5 minutes break. Check notifications after three rounds.");
        lines.push("When will we start the first round today?");
      } else if (/alternative|walk|exercise|book|outside|friend|hobby|outdoor|nature/i.test(lower)) {
        lines.push("I suggest a concrete offline alternative: today, a 10-minute walk + 1 page of a book.");
        lines.push("Small experiment: listen to a playlist instead of the feed; when your hands are busy, the urge to scroll drops.");
      } else if (/sad|angry|guilt|regret|bad feel|ashamed|upset|blue|down/i.test(lower)) {
        lines.push("Let's honor the fact that you named this feeling; guilt does not create motivation — recognizing a pattern does.");
        lines.push("Small experiment: write yourself a note — 'what do I gain if I reduce one overshoot tomorrow?' — and put that sentence on the lockscreen.");
        lines.push("Remember: there is no exam and no punishment here; only small, carefully chosen steps.");
      } else if (/hello|hi|hey\b|good (morning|afternoon|evening)/i.test(lower)) {
        lines.push("Hello! I'm your SÖZÜM SÖZ coach; we can review your screen habits together.");
        lines.push("If you have time: shall I summarize your last 7 days, or shall we start with a small goal?");
      } else {
        lines.push("Let me ask a clarifying question: what purpose are you using the app for right now (boredom, escape, habit)? I'll narrow the focus based on your answer.");
      }
    }
    lines.push("");
    lines.push("This information is for awareness purposes and is not a medical diagnosis or treatment recommendation.");
    return lines.join("\n");
  },

  async chat(cfg, sessions, chatHistory) {
    var agg = AI.aggregate(sessions);
    var context = {
      last7Days: {
        totalSessions: agg.total,
        totalMinutes: agg.usedMin,
        promisesKept: agg.kept,
        promisesBroken: agg.brokenExceed + agg.brokenHop,
        mostUsed: agg.topApps.slice(0, 3).map(function (a) { return a.name + " (" + a.used + " min)"; })
      }
    };
    var messages = [
      { role: "system", content: AI.chatSystem() },
      { role: "system", content: "The user's anonymous data context (JSON; contains no identity): " + JSON.stringify(context) }
    ];
    chatHistory.slice(-20).forEach(function (m) { messages.push({ role: m.role, content: m.content }); });
    var promptText = messages.map(function (m) { return (m.role === "user" ? "USER" : m.role === "assistant" ? "COACH" : "SYSTEM") + ":\n" + m.content; }).join("\n\n");
    var last = chatHistory[chatHistory.length - 1];
    var lastQ = (last && last.content) || "";
    if (AI.isCrisis(lastQ)) {
      return { text: AI.crisisReply(), source: "guard", prompt: promptText };
    }
    if (AI.isMedical(lastQ)) {
      return { text: AI.medicalReply(), source: "guard", prompt: promptText };
    }
    var offTopic = AI.detectOffTopic(lastQ);
    if (offTopic) {
      return { text: AI.offTopicReply(offTopic), source: "guard", prompt: promptText };
    }
    if (cfg.live && cfg.apiKey) {
      try {
        var text = await AI.requestChat(cfg, messages);
        return { text: text, source: "live", prompt: promptText };
      } catch (err) {
        return { text: AI.fallbackChat(agg, lastQ), source: "live-error", prompt: promptText, error: err.message };
      }
    }
    await new Promise(function (r) { setTimeout(r, 700); });
    return { text: AI.fallbackChat(agg, lastQ), source: "template", prompt: promptText };
  }
};