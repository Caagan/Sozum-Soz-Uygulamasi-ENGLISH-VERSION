const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..', 'src');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'file://' + root + '/index.html'
});

dom.window.__SS_INSTANT = true;
dom.window.addEventListener('error', (e) => {
  console.error('WINDOW ERROR:', e.error ? e.error.stack : e.message);
});

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  await wait(1200);
  const w = dom.window;
  const d = w.document;

  const checks = [];
  const ok = (name) => checks.push('OK  ' + name);
  const bad = (name, err) => checks.push('FAIL ' + name + ' :: ' + (err && err.message));

try {
    // Direct boot: no cookie/consent gate, the app opens instantly
    if (!d.getElementById('consentScreen')) ok('no consent gate element (consentScreen removed)');
    else bad('consentScreen still exists');
    if (d.getElementById('consentScreen') === null && d.getElementById('phoneScreen')) ok('app boots directly (phoneScreen present)');
    else bad('direct boot');

    if (d.getElementById('phoneScreen').querySelector('.app-tile')) ok('home app grid rendered (direct boot)');
    else bad('app grid');
    if (d.querySelector('.app-tile[data-app="sozumsoz"]')) ok('SÖZÜM SÖZ app icon on the home screen');
    else bad('sozumsoz icon');
    const ytImg = d.querySelector('.app-tile[data-app="youtube"] .app-icon-img');
    if (ytImg && ytImg.getAttribute('src').indexOf('data:image/svg+xml') === 0) ok('app logos rendered as inline SVG data-URIs');
    else bad('app logo');
    if (d.getElementById('hPoints')) ok('header points rendered');
    else bad('header');

    // Weekly challenges tab: render + join
    d.querySelector('.tab[data-tab="challenges"]').click();
    await wait(60);
    const chCards = d.querySelectorAll('#challengeList .ch-card');
    if (chCards.length === 5) ok('challenges tab: 5 weekly challenges rendered');
    else bad('challenge count: ' + chCards.length);
    const joinBtn = d.querySelector('#challengeList [data-join="screen10"]');
    if (joinBtn) { joinBtn.click(); await wait(40); }
    if (d.querySelector('#challengeList [data-join="screen10"]')) bad('join button did not disappear');
    else ok('joined the challenge (Challenges tab)');
    d.querySelector('.tab[data-tab="phone"]').click();
    await wait(200);

    // Time-promise flow: tap an app, pick 5 min, make the promise
    const tile = d.querySelector('.app-tile[data-app="youtube"]');
    tile.click();
    await wait(50);
    if (d.getElementById('promiseScrim') && d.querySelector('.s-sheet')) ok('time-promise in-phone sheet opened');
    else bad('sheet');
    if (d.querySelector('.sheet-appicon .app-icon-img')) ok('sheet header shows the app logo');
    else bad('sheet logo');
    if (d.querySelectorAll('.dur-chip').length === 8) ok('8 time option chips rendered');
    else bad('time chip count: ' + d.querySelectorAll('.dur-chip').length);
    if (d.getElementById('promiseOk').disabled) ok('"Promise" locked before a time is chosen');
    else bad('Promise lock');
    if (d.querySelector('.appbar, .app-grid') === null) ok('home screen replaced while sheet is open');
    else bad('sheet overlap');
    const timeBtn = d.querySelector('.time-btn[data-min="5"]');
    timeBtn.click();
    await wait(50);
    if (d.querySelector('.dur-chip[data-min="5"]').classList.contains('sel')) ok('selected time chip is marked');
    else bad('chip selection');
    const okBtn = d.getElementById('promiseOk');
    okBtn.click();
    await wait(50);
    if (d.getElementById('appTimerCard')) ok('app screen opened (timer card present)');
    else bad('timer card');
    if (d.querySelector('.appbar') && d.querySelector('.appbar-badge')) ok('app bar + "PROMISE active" badge present');
    else bad('app bar');
    if (d.querySelector('.appbar-icon .app-icon-img')) ok('app bar shows the app logo');
    else bad('app bar logo');
    if (d.querySelectorAll('.post-card').length === 3) ok('feed: 3 mock social posts rendered');
    else bad('post card count');
    if (d.getElementById('bgNotif')) ok('background notification visible (weekly emoji)');
    else bad('background notification');
    if (d.getElementById('hMood').textContent.length > 0) ok('header weekly score emoji present');
    else bad('weekly score emoji');

    // Fast demo: 1 sec = 1 min; a 5-min promise overshoots after ~6 sec
    await wait(7600);
    if (d.getElementById('overBanner')) ok('overshoot banner appeared');
    else bad('overshoot banner');
    if (d.querySelectorAll('#notifStack .notif').length <= 3) ok('notification stack capped at 3 toasts (clustering prevented)');
    else bad('toast count: ' + d.querySelectorAll('#notifStack .notif').length);

    // Keep the promise and close (will still record an overshoot)
    const keepBtn = d.getElementById('btnKeep');
    if (keepBtn) { keepBtn.click(); await wait(50); }
    const points1 = parseInt(d.getElementById('hPoints').textContent, 10);
    if (points1 > 0 || d.getElementById('phoneScreen').querySelector('.app-tile')) ok('session closed, back to home screen');
    else bad('session close');
    if (!d.getElementById('bgNotif')) ok('background notification removed when the session closes');
    else bad('background notification removal');

    // Open the SÖZÜM SÖZ app in the phone → consent must appear first
    d.querySelector('.app-tile[data-app="sozumsoz"]').click();
    await wait(60);
    if (d.getElementById('phoneScreen').querySelector('.s-consent')) ok('tapping the SÖZÜM SÖZ icon shows the consent screen');
    else bad('consent screen');
    if (!d.getElementById('phoneScreen').querySelector('.s-soz')) ok('app stays locked before consent is given');
    else bad('consent lock');

    // Decline → app must not open
    d.getElementById('consentNo').click();
    await wait(40);
    if (d.getElementById('phoneScreen').textContent.indexOf('App unavailable') !== -1) ok('declining shows the not-opened message');
    else bad('decline block');
    if (!d.getElementById('phoneScreen').querySelector('.s-soz')) ok('declining keeps the app closed');
    else bad('decline lock');
    d.getElementById('consentExit').click();
    await wait(40);
    if (d.getElementById('phoneScreen').querySelector('.app-grid')) ok('home app grid after going back');
    else bad('home after consent');

    // Tap the icon again and accept → the app opens
    d.querySelector('.app-tile[data-app="sozumsoz"]').click();
    await wait(60);
    d.getElementById('consentYes').click();
    await wait(80);
    if (d.getElementById('phoneScreen').querySelector('.s-soz')) ok('SÖZÜM SÖZ app opened in the phone (after consent)');
    else bad('sozumsoz app screen');
    if (d.getElementById('phoneScreen').querySelectorAll('.soz-row').length >= 5) ok('app menu (5 page links) rendered');
    else bad('sozumsoz menu');
    if (d.getElementById('bgNotif')) ok('notification visible while SÖZÜM SÖZ is open');
    else bad('sozumsoz notification');
    d.getElementById('sozBack').click();
    await wait(50);
    if (d.getElementById('phoneScreen').querySelector('.app-grid')) ok('back to home screen');
    else bad('go back');
    if (!d.getElementById('bgNotif')) ok('notification removed when going back');
    else bad('back notification');
    // Consent is remembered: tapping the icon opens the app directly
    d.querySelector('.app-tile[data-app="sozumsoz"]').click();
    await wait(60);
    if (d.getElementById('phoneScreen').querySelector('.s-soz') && !d.getElementById('phoneScreen').querySelector('.s-consent')) ok('after accepting, the icon opens the app directly');
    else bad('consent memory');
    d.getElementById('sozBack').click();
    await wait(40);

    // weekly score emoji demo button
    d.querySelector('[data-mood="bad"]').click();
    await wait(30);
    if (d.getElementById('hMood').textContent === '🙁') ok('demo score button changed the emoji (bad 🙁)');
    else bad('demo score button (bad) -> ' + d.getElementById('hMood').textContent);
    d.querySelector('[data-mood="good"]').click();
    await wait(30);
    if (d.getElementById('hMood').textContent === '😀') ok('demo score button changed the emoji (good 😀)');
    else bad('demo score button (good) -> ' + d.getElementById('hMood').textContent);
    d.querySelector('[data-mood="auto"]').click();
    await wait(30);

    // AI tab
    d.querySelector('.tab[data-tab="ai"]').click();
    await wait(50);
    d.getElementById('btnDailyAI').click();
    await wait(1200);
    const aiOut = d.getElementById('aiOutput').textContent;
    if (!/No output yet/.test(aiOut)) ok('AI daily reflection generated (first 80 + last 80)');
    else bad('AI daily reflection');
    ok('AI output (snippet): ' + aiOut.replace(/\n/g, ' ').slice(0, 70));
    d.getElementById('btnWeeklyAI').click();
    await wait(1200);
    const aiOut2 = d.getElementById('aiOutput').textContent;
    if (!/No output yet/.test(aiOut2)) ok('AI weekly summary generated');
    else bad('AI weekly summary');

    // Multi-turn chat
    d.querySelector('.tab[data-tab="chat"]').click();
    await wait(50);
    d.querySelector('.chip[data-q^="Make"]').click();
    await wait(1600);
    const chatLog = d.getElementById('chatLog');
    if (chatLog.querySelector('.chat-msg.user') && chatLog.querySelector('.chat-msg.assistant')) ok('chat: user + coach messages present');
    else bad('chat messages');
    if (chatLog.textContent.indexOf('awareness purposes') !== -1) ok('chat: legal warning line in the coach response');
    else bad('chat legal warning: ' + chatLog.textContent.slice(-50));
    const assistMsgs = d.querySelectorAll('#chatLog .chat-msg.assistant');
    const lastAssist = assistMsgs[assistMsgs.length - 1];
    if (lastAssist && lastAssist.querySelector('.ai-badge') && lastAssist.querySelector('.ai-stamp')) ok('AI stamp (badge + disclaimer) visible');
    else bad('AI stamp');
    // second turn (multi-turn continuity)
    d.getElementById('chatInput').value = 'Suggest a break';
    d.getElementById('chatSend').click();
    await wait(1600);
    if (chatLog.textContent.indexOf('A good step') !== -1) ok('chat: second-turn response arrived (multi-turn)');
    else bad('second-turn response');

    // Crisis guard: routing to support lines, no diagnosis
    d.getElementById('chatInput').value = 'I want to hurt myself, I cannot take it anymore';
    d.getElementById('chatSend').click();
    await wait(400);
    const crisisMsgs = d.querySelectorAll('#chatLog .chat-msg.assistant');
    const crisisText = crisisMsgs[crisisMsgs.length - 1] ? crisisMsgs[crisisMsgs.length - 1].textContent : '';
    if (crisisText.indexOf('115') !== -1 && crisisText.indexOf('112') !== -1) ok('crisis guard: routed to support lines first (115/112)');
    else bad('crisis guard routing: ' + crisisText.slice(-90));
    if (/medical|treatment/.test(crisisText)) ok('crisis guard: no diagnosis/treatment claim (warning line)');
    else bad('crisis guard warning');

    // Status tab
    d.querySelector('.tab[data-tab="stats"]').click();
    await wait(50);
    if (d.querySelector('#statCards .stat-card')) ok('status cards rendered');
    else bad('status cards');

    // Charts
    d.querySelector('.tab[data-tab="charts"]').click();
    await wait(80);
    if (d.getElementById('chartLast7').innerHTML.indexOf('day-bar') !== -1) ok('chart: last 7 days bars rendered');
    else bad('chart: last 7 days');
    if (d.getElementById('chartTodayVsWeek').innerHTML.indexOf('cmp-bar') !== -1) ok('chart: today vs same day last week comparison');
    else bad('chart: comparison');
    if (d.getElementById('chartCategories').innerHTML.indexOf('donut') !== -1) ok('chart: category donut rendered');
    else bad('chart: category donut');

    // Rewards
    d.querySelector('.tab[data-tab="rewards"]').click();
    await wait(50);
    if (d.querySelector('#rewardGrid .reward-card')) ok('reward catalog rendered');
    else bad('reward catalog');

    // Draw
    d.querySelector('.tab[data-tab="draw"]').click();
    await wait(50);
    if (d.getElementById('prizeList').children.length > 0) ok('draw prizes rendered');
    else bad('draw prizes');

    // Open settings
    d.getElementById('btnSettings').click();
    await wait(50);
    if (d.getElementById('setLive')) ok('settings modal opened');
    else bad('settings modal');
    const prov = d.getElementById('setProvider');
    if (prov) {
      prov.value = 'gemini';
      prov.dispatchEvent(new w.Event('change'));
      if (d.getElementById('setBase').value.indexOf('generativelanguage') !== -1 && d.getElementById('setModel').value.indexOf('gemini') !== -1) ok('Gemini provider selection auto-sets URL/model');
      else bad('gemini provider settings');
    }
    d.getElementById('setCancel').click();
    await wait(30);

    // recent activity
    if (d.querySelector('#phoneFeed .feed-item')) ok('recent activity feed is populated');
    else bad('recent activity feed');

    // --- phase 2: keep the promise on time, then quickly switch apps (hop penalty) ---
    d.getElementById('btnReset').click();
    await wait(50);
    d.getElementById('resetYes').click();
    await wait(800);
    d.querySelector('.app-tile[data-app="youtube"]').click();
    await wait(50);
    d.querySelector('.time-btn[data-min="5"]').click();
    await wait(50);
    d.getElementById('promiseOk').click();
    await wait(80);
    const keepEarly = d.getElementById('btnKeep');
    keepEarly.click();
    await wait(80);
    const pAfterKeep = parseInt(d.getElementById('hPoints').textContent, 10);
    if (pAfterKeep === 3) ok('promise kept (+3 points, streak 1)');
    else bad('keep reward points: ' + pAfterKeep);
    // immediately enter a second app (within the 90s window) → hop penalty
    d.querySelector('.app-tile[data-app="instagram"]').click();
    await wait(50);
    d.querySelector('.time-btn[data-min="5"]').click();
    await wait(50);
    d.getElementById('promiseOk').click();
    await wait(120);
    const pAfterHop = parseInt(d.getElementById('hPoints').textContent, 10);
    if (pAfterHop === 0) ok('hop penalty applied (points pulled back to zero)');
    else bad('hop penalty points: ' + pAfterHop);
    const str = d.getElementById('hStreak').textContent;
    if (str === '0') ok('streak reset');
    else bad('streak: ' + str);

    // --- phase 3: AI coach micro-break flow (overshoot -> break card -> +5 points) ---
    d.getElementById('notifStack').innerHTML = '';
    const pointsB = parseInt(d.getElementById('hPoints').textContent, 10);
    await wait(7000);          // 5-min promise is exceeded in fast demo
    await wait(1500);          // coach notification (template) is generated
    let coachBtn = null;
    d.querySelectorAll('.notif.k-warn .notif-actions .btn').forEach(b => {
      if (!coachBtn && b.textContent.indexOf('Start break') !== -1) coachBtn = b;
    });
    if (coachBtn) ok('AI coach empathetic break card generated');
    else bad('AI coach break card');
    if (coachBtn) {
      coachBtn.click();
      await wait(120);
      if (d.querySelector('.s-break')) ok('break screen opened (countdown)');
      else bad('break screen');
      await wait(600);
      if (parseInt(d.getElementById('hPoints').textContent, 10) === pointsB) ok('points stay unchanged during the break');
      else bad('points changed during break');
      await wait(20500);
      const pFin = parseInt(d.getElementById('hPoints').textContent, 10);
      if (pFin === pointsB + 5) ok('break completed, +5 points earned');
      else bad('break points: expected ' + (pointsB + 5) + ', got ' + pFin);
      if (d.getElementById('appTimerCard')) ok('session screen restored after the break');
      else bad('screen restore after break');
      d.querySelector('.tab[data-tab="stats"]').click();
      await wait(80);
      let breakStat = false;
      d.querySelectorAll('.stat-card').forEach(c => {
        if (c.textContent.indexOf('Break') !== -1 && c.textContent.indexOf('1') !== -1) breakStat = true;
      });
      if (breakStat) ok('stat card shows "Breaks completed: 1"');
      else bad('break statistic');
      // claim the weekly challenge reward: screen10 (7-day usage < 600 min met)
      d.querySelector('.tab[data-tab="challenges"]').click();
      await wait(80);
      const claimBtn = d.querySelector('#challengeList [data-claim="screen10"]');
      const ptsBefore = parseInt(d.getElementById('hPoints').textContent, 10);
      if (claimBtn) { claimBtn.click(); await wait(60); }
      if (parseInt(d.getElementById('hPoints').textContent, 10) === ptsBefore + 10) ok('weekly challenge reward added (+10 points)');
      else bad('weekly challenge reward points');
      if (d.querySelector('#challengeList [data-claim="screen10"]')) bad('challenge reward button not removed');
      else ok('challenge reward is one-time (claim button removed)');
      // AI coach prompt design note check
      d.querySelector('.tab[data-tab="ai"]').click();
      await wait(50);
      d.getElementById('btnWeeklyAI').click();
      await wait(1200);
      const tog = d.querySelector('.prompt-toggle');
      if (tog) { tog.click(); await wait(50); }
      const box = d.querySelector('.prompt-box');
      if (box && box.textContent.indexOf('Notification coach') !== -1) ok('prompt box documents the coach design');
      else bad('prompt box coach section');
    }

    // --- notification clustering / dedupe check ---
    const notifFn = d.defaultView.__ss_notify;
    if (notifFn) {
      notifFn('Same title', 'same content', 'info');
      notifFn('Same title', 'same content', 'info');
      await wait(30);
      let same = 0;
      d.querySelectorAll('#notifStack .notif').forEach(n => {
        const t = n.querySelector('.n-title');
        if (t && t.textContent === 'Same title') same++;
      });
      if (same === 1) ok('identical notifications are not duplicated (dedupe)');
      else bad('dedupe: ' + same);
      notifFn('One', 'one', 'info');
      notifFn('Two', 'two', 'info');
      notifFn('Three', 'three', 'info');
      notifFn('Four', 'four', 'info');
      await wait(30);
      const total = d.querySelectorAll('#notifStack .notif').length;
      if (total <= 3) ok('notification stack capped at 3 toasts (older ones removed)');
      else bad('toast limit: ' + total);
    } else {
      bad('test hook __ss_notify missing');
    }

  } catch (err) {
    bad('general', err);
  }

  console.log(checks.join('\n'));
  process.exit(0);
})();