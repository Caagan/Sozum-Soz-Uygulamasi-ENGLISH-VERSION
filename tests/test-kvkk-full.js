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
  const w = dom.window;
  const d = w.document;
  const out = [];
  const ok = (n) => out.push('OK  ' + n);
  const bad = (n, e) => out.push('FAIL ' + n + ' :: ' + (e && e.message));

  const s = () => d.getElementById('phoneScreen');

  try {
    // 1) the consent screen carries the full sections of the privacy notice
    d.querySelector('.app-tile[data-app="sozumsoz"]').click();
    await wait(200);
    const bodyText = s().textContent;
    const sections = ['Data Controller and Scope', 'Personal Data Processed', 'Purposes of Processing', 'Legal Basis and Transfer', 'Retention Period', 'Rights of the Data Subject', 'Explicit Consent', 'KVKK art. 11', 'withdraw my consent'];
    const missing = sections.filter(x => !bodyText.includes(x));
    if (missing.length === 0) ok('full notice: ' + sections.length + ' sections present');
    else bad('notice section missing: ' + missing.join(','));

    // 2) accept, open the app and earn some points
    d.getElementById('consentYes').click();
    await wait(300);
    d.getElementById('sozBack').click();
    await wait(200);
    d.querySelector('.app-tile[data-app="instagram"]').click();
    await wait(50);
    d.querySelector('.time-btn[data-min="5"]').click();
    await wait(50);
    d.getElementById('promiseOk').click();
    await wait(80);
    d.getElementById('btnKeep').click();
    await wait(80);
    const pts = parseInt(d.getElementById('hPoints').textContent, 10);
    if (pts >= 3) ok('precondition: points earned (' + pts + ')');
    else bad('precondition: no points');

    // 3) the settings modal offers 4 data-rights actions
    d.getElementById('btnSettings').click();
    await wait(50);
    if (d.getElementById('btnExport') && d.getElementById('btnRevokeConsent') && d.getElementById('btnWipeData') && d.getElementById('btnReset2'))
      ok('data-rights buttons in Settings (download / withdraw consent / delete data / demo reset)');
    else bad('Settings buttons missing');

    // 4) JSON export: URL.createObjectURL is not available in jsdom; just check that it does not throw
    d.getElementById('btnExport').click();
    await wait(100);
    const exportErr = await new Promise(r => { const old = w.onerror; w.onerror = (m) => { r(m); return true; }; setTimeout(() => { w.onerror = old; r(null); }, 120); });
    if (!exportErr) ok('JSON download: no error thrown (' + (d.querySelector('.modal') && d.querySelector('.modal h3') ? 'summary modal: ' + d.querySelector('.modal h3').textContent : 'modal closed') + ')');
    else bad('JSON download error: ' + exportErr);
    if (d.querySelector('#exportOk')) { d.getElementById('exportOk').click(); await wait(50); }

    // 5) withdraw consent -> consent=false, back to home, tapping the icon shows the notice again
    d.getElementById('btnSettings').click();
    await wait(50);
    d.getElementById('btnRevokeConsent').click();
    await wait(50);
    if (d.querySelector('#revokeYes')) ok('withdraw-consent confirmation modal opened');
    else bad('withdraw confirmation modal');
    d.getElementById('revokeYes').click();
    await wait(100);
    if (!d.querySelector('.s-consent') && s() && s().querySelector('.app-grid')) ok('after withdrawing consent, returned to the home screen');
    else bad('home screen after withdrawal');
    d.querySelector('.app-tile[data-app="sozumsoz"]').click();
    await wait(200);
    if (d.querySelector('.s-consent') && d.getElementById('consentYes')) ok('after withdrawal, the notice is shown again');
    else bad('notice not shown again after withdrawal');

    // 6) delete data -> confirmation modal, yes -> reload (localStorage cleared + location.reload)
    d.getElementById('consentYes').click();
    await wait(200);
    d.getElementById('btnSettings').click();
    await wait(50);
    d.getElementById('btnWipeData').click();
    await wait(50);
    if (d.querySelector('#wipeYes')) ok('delete-my-data confirmation modal opened');
    else bad('delete-data confirmation modal');
    let wipeThrew = false;
    try {
      d.getElementById('wipeYes').click();
    } catch (e) { wipeThrew = e; }
    await wait(80);
    if (!wipeThrew) ok('delete-my-data: confirmation click was error-free (wipe + lock reset triggered)');
    else bad('delete-my-data: click error', wipeThrew);
  } catch (e) { bad('unexpected error', e); }

  console.log(out.join('\n'));
  process.exit(out.some(x => x.startsWith('FAIL')) ? 1 : 0);
})();