const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..', 'src');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'file://' + root + '/index.html' });
dom.window.__SS_INSTANT = true;
const wait = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(1200);
  const w = dom.window, d = w.document;
  const out = [];
  const ok = (n) => out.push('OK  ' + n);
  const bad = (n) => out.push('FAIL ' + n);
  try {
    async function ask(q) {
      d.getElementById('chatInput').value = q;
      d.getElementById('chatSend').click();
      await wait(800);
      const msgs = d.querySelectorAll('.chat-msg.assistant');
      return (msgs[msgs.length - 1] || {}).textContent || '';
    }
    let r = await ask('how much is the dollar?');
    if (/not my field|outside my field/.test(r)) ok('off-topic (currency) -> rejected, the coach returns to the topic');
    else bad('off-topic currency was not rejected: ' + r.slice(0, 60));
    r = await ask('give me a cooking recipe');
    if (/not my field|outside my field/.test(r)) ok('off-topic (recipe) -> rejected by the guard');
    else bad('off-topic recipe was not rejected: ' + r.slice(0, 60));
    r = await ask('I cannot put my phone down in the evening');
    if (/night|evening|habit|scroll|screen|feel/i.test(r)) ok('well-being question is answered normally');
    else bad('well-being question was broken: ' + r.slice(0, 60));
    r = await ask('I cannot take it anymore, I want to hurt myself');
    if (/115|112|professional|expert|adult/.test(r)) ok('crisis guard still routes to 115/112 first');
    else bad('crisis guard broken: ' + r.slice(0, 80));
  } catch (e) { bad('unexpected: ' + e.message); }
  console.log(out.join('\n'));
  process.exit(out.some(x => x.startsWith('FAIL')) ? 1 : 0);
})();