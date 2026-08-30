const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..', 'src');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'file://' + root + '/index.html' });
dom.window.__SS_INSTANT = true;
dom.window.addEventListener('error', (e) => console.error('WINDOW ERROR:', e.error ? e.error.stack : e.message));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(1200);
  const w = dom.window, d = w.document;
  const out = [];
  const ok = (n) => out.push('OK  ' + n);
  const bad = (n, e) => out.push('FAIL ' + n + ' :: ' + (e && e.message));
  try {
    // Permanent disclaimer under the AI output card
    const aiNote = (d.querySelector('#aiOutputCard .input-ai-note') || {}).textContent || '';
    if (aiNote.length > 0 && aiNote.indexOf('artificial intelligence') !== -1 && aiNote.indexOf('mistakes') !== -1 && aiNote.indexOf('awareness') !== -1)
      ok('permanent disclaimer under the AI output card (AI, mistakes, awareness)');
    else bad('AI output card disclaimer missing: ' + aiNote);

    // Permanent disclaimer above the chat input box
    const chatNote = (d.querySelector('#tab-chat .input-ai-note') || {}).textContent || '';
    if (chatNote && chatNote.indexOf('artificial intelligence') !== -1 && chatNote.indexOf('mistakes') !== -1)
      ok('permanent AI disclaimer above the chat input');
    else bad('chat input disclaimer missing: ' + chatNote);

    // Generate the daily reflection -> the fresh ai-stamp must contain the full disclaimer
    d.getElementById('btnDailyAI').click();
    await wait(700);
    const aiOut = d.getElementById('aiOutput');
    if (aiOut.querySelector('.ai-stamp')) {
      const st = aiOut.querySelector('.ai-stamp').textContent;
      if (st.indexOf('can make mistakes') !== -1 && st.indexOf('professional') !== -1)
        ok('full AI stamp under the daily reflection output (mistakes + professional)');
      else bad('daily stamp short: ' + st);
    } else bad('daily reflection stamp missing');

    // Start a chat -> the assistant message must carry the full stamp
    d.getElementById('chatInput').value = 'How is it going today?';
    d.getElementById('chatSend').click();
    await wait(700);
    const msgs = d.querySelectorAll('.chat-msg.assistant');
    if (msgs.length) {
      const lastSt = msgs[msgs.length - 1].querySelector('.ai-stamp');
      if (lastSt && lastSt.textContent.indexOf('professional') !== -1) ok('full stamp in the chat assistant response');
      else bad('chat stamp missing: ' + (lastSt && lastSt.textContent));
    } else bad('no chat message received');
    // the crisis-guard response must carry the stamp too
    d.getElementById('chatInput').value = 'I cannot take it anymore, I want to hurt myself';
    d.getElementById('chatSend').click();
    await wait(500);
    const msgs2 = d.querySelectorAll('.chat-msg.assistant');
    const cst = msgs2[msgs2.length - 1].querySelector('.ai-stamp');
    if (cst) ok('crisis-guard response also carries the AI stamp');
    else bad('crisis-guard stamp missing');
  } catch (e) { bad('unexpected error', e); }
  console.log(out.join('\n'));
  process.exit(out.some(x => x.startsWith('FAIL')) ? 1 : 0);
})();