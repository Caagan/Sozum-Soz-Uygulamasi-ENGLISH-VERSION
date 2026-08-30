const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..', 'dist');
const html = fs.readFileSync(path.join(root, 'SOZUM-SOZ-SINGLEFILE.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'file://' + root + '/SOZUM-SOZ-SINGLEFILE.html' });
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
    if (d.getElementById('phoneScreen')) ok('single file: booted directly');
    else bad('single file: does not boot');
    const tile = d.querySelector('.app-tile[data-app="sozumsoz"]');
    if (tile) ok('single file: SÖZÜM SÖZ icon present');
    else bad('single file: icon');
    tile.click();
    await wait(200);
    if (d.querySelector('.s-consent')) ok('single file: tapping icon shows the consent screen');
    else bad('single file: consent screen');
    if (!d.querySelector('.s-soz')) ok('single file: app locked until consent is given');
    else bad('single file: app opened without consent');
    d.getElementById('consentYes').click();
    await wait(300);
    if (d.querySelector('.s-soz') && !d.querySelector('.s-consent')) ok('single file: app opens after consent');
    else bad('single file: opening after consent');
  } catch (e) { bad('unexpected error', e); }
  console.log(out.join('\n'));
  process.exit(out.some(x => x.startsWith('FAIL')) ? 1 : 0);
})();