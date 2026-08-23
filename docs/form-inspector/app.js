'use strict';

const input = document.querySelector('#source');
const inspectButton = document.querySelector('#inspect');
const brokenButton = document.querySelector('#load-broken');
const goodButton = document.querySelector('#load-good');
const downloadButton = document.querySelector('#download');
const result = document.querySelector('#result');
const summary = document.querySelector('#summary');
const list = document.querySelector('#findings');
let lastReport = null;

const examples = {
  broken: `<form action="#">
  <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">
  <label>Email <input type="email" required></label>
  <label>Message <textarea required></textarea></label>
  <button type="submit">Send</button>
</form>
<p id="status"></p>
<script>
  document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    document.querySelector('#status').textContent = 'Message received';
    event.currentTarget.reset();
  });
</script>`,
  good: `<form action="https://formspree.io/f/example" method="post">
  <label>Email <input type="email" name="email" required></label>
  <label>Message <textarea name="message" required></textarea></label>
  <button type="submit">Send</button>
</form>`,
};

function render() {
  const report = window.StaticFormInspector.inspectHtml(input.value);
  const errors = report.findings.filter(item => item.severity === 'error').length;
  const warnings = report.findings.length - errors;
  lastReport = { generated_at: new Date().toISOString(), forms_scanned: report.forms, findings: report.findings };
  list.replaceChildren();

  if (!report.forms) {
    summary.textContent = 'No <form> element found in the pasted source.';
    result.dataset.state = 'empty';
  } else if (!report.findings.length) {
    summary.textContent = `Checked ${report.forms} form${report.forms === 1 ? '' : 's'}: no risks found by these static checks.`;
    result.dataset.state = 'clear';
  } else {
    summary.textContent = `Checked ${report.forms} form${report.forms === 1 ? '' : 's'}: ${errors} error${errors === 1 ? '' : 's'} and ${warnings} warning${warnings === 1 ? '' : 's'}.`;
    result.dataset.state = errors ? 'error' : 'warning';
    for (const item of report.findings) {
      const row = document.createElement('li');
      row.className = item.severity;
      const heading = document.createElement('strong');
      heading.textContent = `${item.severity.toUpperCase()} · line ${item.line} · ${item.rule}`;
      const detail = document.createElement('span');
      detail.textContent = item.message;
      row.append(heading, detail);
      list.append(row);
    }
  }
  downloadButton.disabled = false;
  result.hidden = false;
  result.focus();
}

inspectButton.addEventListener('click', render);
brokenButton.addEventListener('click', () => { input.value = examples.broken; render(); });
goodButton.addEventListener('click', () => { input.value = examples.good; render(); });
downloadButton.addEventListener('click', () => {
  if (!lastReport) return;
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(lastReport, null, 2)}\n`], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'static-form-inspector-report.json';
  link.click();
  URL.revokeObjectURL(url);
});
