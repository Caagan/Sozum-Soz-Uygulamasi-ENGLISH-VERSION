// ---------- Data: apps, rewards, draw, challenges ----------

const CATEGORY_LABELS = {
  social: "Social Media",
  video: "Video",
  messaging: "Messaging",
  streaming: "Series / Movies",
  gaming: "Gaming",
  music: "Music",
  news: "News / Reading"
};

const CATEGORY_GLYPHS = {
  social: ["📱", "💬", "📸"],
  video: ["🎬", "▶️", "🎞️"],
  messaging: ["💬", "👋", "🗯️"],
  streaming: ["🎬", "🍿", "📺"],
  gaming: ["🎮", "🏆", "🕹️"],
  music: ["🎧", "🎵", "🎤"],
  news: ["📰", "📖", "☕"]
};

const APPS = [
  {
    id: "instagram", name: "Instagram", monogram: "IG", color: "#e1306c", category: "social",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#f09433'/><stop offset='0.4' stop-color='#e6683c'/><stop offset='0.6' stop-color='#dc2743'/><stop offset='1' stop-color='#cc2366'/></linearGradient><rect x='2' y='2' width='20' height='20' rx='6' fill='url(#g)'/><rect x='4.6' y='4.6' width='14.8' height='14.8' rx='4.4' fill='none' stroke='#fff' stroke-width='1.7'/><circle cx='12' cy='12' r='3.9' fill='none' stroke='#fff' stroke-width='1.7'/><circle cx='16.8' cy='7.2' r='1.25' fill='#fff'/></svg>"
  },
  {
    id: "youtube", name: "YouTube", monogram: "YT", color: "#dc2626", category: "video",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='1.8' y='5.2' width='20.4' height='13.6' rx='4' fill='#ff0000'/><path d='M10 9.2v5.6l5-2.8z' fill='#fff'/></svg>"
  },
  {
    id: "tiktok", name: "TikTok", monogram: "TT", color: "#111827", category: "video",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#010101'/><path d='M12 6v7.4a2.6 2.6 0 1 1-2.6-2.6v2.2a.55.55 0 1 0 .55 1.1' stroke='#69c9d0' stroke-width='2.1' fill='none'/><path d='M12 6c.2 2.8 1.7 4.3 4.6 4.6' stroke='#fff' stroke-width='2.1' fill='none' stroke-linecap='round'/><path d='M12 6v7.4a2.6 2.6 0 1 1 2.6-2.9' stroke='#ee1d52' stroke-width='2.1' fill='none'/></svg>"
  },
  {
    id: "whatsapp", name: "WhatsApp", monogram: "WA", color: "#16a34a", category: "messaging",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#25d366'/><path d='M12 4.8a7.2 7.2 0 0 0-6.2 11l-1.1 3.8 3.9-1a7.2 7.2 0 1 0 3.4-13.8z' fill='#fff'/><path d='M9.2 8.6c.3-.6.8-.8 1.2-.4l.8 1c.3.4.2.7 0 1l-.6.6c.1.6.5 1.2 1.2 1.8.7.6 1.3.7 1.8.5l.6-.5c.3-.3.6-.3 1 0l.9.8c.4.4.3.7-.2 1a5 5 0 0 1-1.9.9c-1.1.3-2.8-.4-4.3-1.9-1.5-1.5-1.9-3.2-1.5-4.3.2-.8.4-1.4.9-1.5z' fill='#fff'/></svg>"
  },
  {
    id: "x", name: "X", monogram: "X", color: "#334155", category: "social",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#0f172a'/><path d='M5.6 6.2h3.6l3.2 3.5 3.8-3.5h1.5l-4.7 4.7-4.1 3.9h3l-4.4 4.5V14.3l3-2.8' fill='#fff'/></svg>"
  },
  {
    id: "netflix", name: "Netflix", monogram: "NF", color: "#b91c1c", category: "streaming",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='4' fill='#e50914'/><path d='M8.5 5v14H11V10.4L13.5 19h2.1V5h-2.3v8.8L11.1 5z' fill='#fff'/></svg>"
  },
  {
    id: "clashroyale", name: "Clash Royale", monogram: "CR", color: "#7c3aed", category: "gaming",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#7c3aed'/><path d='M7 6.2l2.1 2.1L12 5.8l2.9 2.5L17 6.2l.8 2.7-.8 1.7h-1l-.3 3.4H8.3l-.3-3.4H7l-.8-1.7z' fill='#ffd54a'/></svg>"
  },
  {
    id: "reddit", name: "Reddit", monogram: "RD", color: "#ea580c", category: "news",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#ff4500'/><circle cx='8.6' cy='9.4' r='2.3' fill='#fff'/><circle cx='15.4' cy='9.4' r='2.3' fill='#fff'/><path d='M4.6 12.6c1.8-.5 3.6-.3 4.9.6M19.4 12.6c-1.8-.5-3.6-.3-4.9.6M12 13.4c-2.3 0-3.5 1.3-3.5 2.8 0 1.7 1.5 2.7 3.5 2.7s3.5-1 3.5-2.7c0-1.5-1.2-2.8-3.5-2.8z' fill='none' stroke='#fff' stroke-width='1.5' stroke-linecap='round'/></svg>"
  },
  {
    id: "spotify", name: "Spotify", monogram: "SP", color: "#15803d", category: "music",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#1db954'/><path d='M6 11.3c3.6-1.2 8-.3 12 1.8M6.6 14.5c3-1 6.6-.3 9.4 1.4M7.2 17.4c2.5-.8 5.2-.3 7.4.9' stroke='#191414' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>"
  },
  {
    id: "news", name: "News", monogram: "HN", color: "#0f766e", category: "news",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='2' y='2' width='20' height='20' rx='6' fill='#0f766e'/><rect x='6.2' y='4.8' width='7.4' height='4.4' fill='#fff'/><path d='M6.2 12h11.6M6.2 14.8h11.6M6.2 17.6h8.6' stroke='#fff' stroke-width='1.6' stroke-linecap='round'/></svg>"
  }
];

const TIME_OPTIONS = [2, 5, 10, 15, 20, 30, 45, 60];

// Convert inline SVG logos to data-URIs (offline + single-file friendly)
// Note: Chromium rejects percent-encoded (utf8,) svg data-URIs → use base64.
function svgLogoURI(markup) {
  var bin = "";
  for (var i = 0; i < markup.length; i++) {
    var c = markup.charCodeAt(i);
    bin += String.fromCharCode(c > 255 ? 63 : c);
  }
  return "data:image/svg+xml;base64," + btoa(bin);
}
function appLogoURI(app) {
  return (app && app.svg) ? svgLogoURI(app.svg) : "";
}

// Clickable app icon HTML (img if logo available, otherwise monogram)
function appIconHTML(app, extraClass) {
  var base = "background:linear-gradient(135deg," + app.color + ",#0f172a)";
  var inner = app.svg
    ? "<img class='app-icon-img' src='" + appLogoURI(app) + "' alt='' data-mono='" + app.monogram + "' onerror='window.__ssIconFallback(this)'>"
    : "<span class='app-icon-fall'>" + app.monogram + "</span>";
  return "<div class='" + (extraClass || "app-icon") + "' style='" + base + "'>" + inner + "</div>";
}

// SÖZÜM SÖZ brand logo: shield + checkmark (keeping one's word) + sparkle
var SOZ_LOGO_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>" +
  "<defs><linearGradient id='s' x1='0' y1='0' x2='1' y2='1'>" +
  "<stop offset='0' stop-color='#34d399'/><stop offset='.55' stop-color='#16a34a'/><stop offset='1' stop-color='#0e7490'/>" +
  "</linearGradient></defs>" +
  "<rect x='2' y='2' width='20' height='20' rx='6' fill='url(#s)'/>" +
  "<path d='M12 3.3l5.9 2.35v5.35c0 3.65-2.35 6.85-5.9 8.3-3.55-1.45-5.9-4.65-5.9-8.3V5.65z' fill='#fff'/>" +
  "<path d='M8.7 12.2l2.3 2.3 4.6-4.85' fill='none' stroke='#15803d' stroke-width='2.1' stroke-linecap='round' stroke-linejoin='round'/>" +
  "<path d='M17 3.4c.16 1.35.66 1.94 2 2.1-1.34.16-1.84.75-2 2.1-.16-1.35-.66-1.94-2-2.1 1.34-.16 1.84-.75 2-2.1z' fill='#fde047'/>" +
  "</svg>";
var SOZ_LOGO = svgLogoURI(SOZ_LOGO_SVG);

// Reward catalog — Yeşilay partnership scenario
const REWARDS = [
  { id: "certificate", name: "Yeşilay Healthy Living Certificate", desc: "Your monthly promise report card and participation certificate.", price: 500, monogram: "CE" },
  { id: "book", name: "Yeşilay Children's Book", desc: "A children's book set themed around well-being.", price: 1000, monogram: "BO" },
  { id: "piggybank", name: "Piggy Bank", desc: "A goal-saving piggy bank for kids.", price: 1500, monogram: "PG" },
  { id: "bottle", name: "Yeşilay Water Bottle", desc: "Carry your bottle with you; don't forget your water.", price: 2000, monogram: "BT" },
  { id: "clock", name: "Desk Clock", desc: "Reward your breaks, not the time spent on screens.", price: 3000, monogram: "DC" },
  { id: "thermos", name: "Thermos", desc: "Carry your water with you all day.", price: 4000, monogram: "TH" },
  { id: "plates", name: "Yeşilay Plate Set", desc: "Let your screen time stay as limited as your plate.", price: 5000, monogram: "PL" }
];

const MILESTONES = { 3: 10, 7: 25, 14: 60, 30: 150 };

const DAILY_CHALLENGE = {
  id: "3-soz",
  target: 3,
  title: "Promise of the day",
  text: "Keep 3 promises today to earn bonus points.",
  reward: 20,
  metric: "keptPromises"
};

// Weekly challenges: the user joins each week and earns points when the condition is met.
// metric -> computed in the challengeCurrent() function in app.js.
// direction "less" = value must STAY BELOW the target (e.g. screen < 10 hours).
const CHALLENGES = [
  {
    id: "screen10",
    title: "Weekly screen time < 10 hours",
    text: "Keep your total screen usage under 10 hours (600 min) this week.",
    metric: "weeklyMin", target: 600, unit: "min", direction: "less", reward: 10
  },
  {
    id: "keep7",
    title: "Close 7 promises on time",
    text: "Finish at least 7 sessions within their target time this week.",
    metric: "keptCount", target: 7, unit: "promise", direction: "more", reward: 15
  },
  {
    id: "break5",
    title: "Complete 5 micro-breaks",
    text: "Complete at least 5 micro-breaks this week (suggested by the Reflection Coach).",
    metric: "breaks", target: 5, unit: "break", direction: "more", reward: 10
  },
  {
    id: "apps3",
    title: "Make promises in 3 different apps",
    text: "Set a time promise in at least 3 different apps this week.",
    metric: "distinctApps", target: 3, unit: "app", direction: "more", reward: 8
  },
  {
    id: "low-overshoot",
    title: "Fewer than 3 time overshoots",
    text: "Exceed the time at most 2 times this week (an overshoot caught early doesn't count as a broken promise).",
    metric: "overshootCount", target: 3, unit: "overshoot", direction: "less", reward: 12
  }
];

const DRAW_PRIZES = [
  "Holiday / travel package (with family)",
  "Laptop",
  "Smartphone",
  "Game console and accessories",
  "Yeşilay experience package (awareness camp)"
];

const DRAW_TARGET_KEPT = 30; // number of promises to keep within the month

const MOCK_MEDIA = ["#7dd3fc", "#fca5a5", "#86efac", "#fde68a", "#d8b4fe", "#f9a8d4", "#93c5fd", "#fdba74"];