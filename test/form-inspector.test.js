'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { inspectHtml } = require('../docs/form-inspector/inspector.js');

test('accepts a named POST form with a delivery endpoint', () => {
  const report = inspectHtml('<form action="https://formspree.io/f/example" method="post"><input type="email" name="email"><textarea name="message"></textarea><button>Send</button></form>');
  assert.equal(report.forms, 1);
  assert.deepEqual(report.findings, []);
});

test('reports the broken example accurately', () => {
  const report = inspectHtml('<form action="#">\n<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">\n<input type="email">\n<textarea></textarea>\n</form>');
  assert.deepEqual(report.findings.map(item => item.rule), ['inert-action', 'placeholder-credential', 'contact-form-get', 'missing-field-name', 'missing-field-name']);
  assert.equal(report.findings[3].line, 3);
});

test('handles multiple and unclosed forms', () => {
  const report = inspectHtml('<form action="/one" method="post"><input name="one"></form>\n<form action="/two" method="post"><input name="two">');
  assert.equal(report.forms, 2);
  assert.equal(report.findings.at(-1).rule, 'unclosed-form');
  assert.equal(report.findings.at(-1).line, 2);
});

test('warns about inline false-success handling without overclaiming JavaScript coverage', () => {
  const falseSuccess = `<form id="contact" action="/send" method="post"><input type="email" name="email"><textarea name="message"></textarea></form>
  <script>document.querySelector('#contact').addEventListener('submit', event => { event.preventDefault(); document.body.textContent = 'Message received'; event.currentTarget.reset(); });</script>`;
  const delivered = falseSuccess.replace("event.preventDefault();", "event.preventDefault(); fetch('/send', { method: 'POST' });");
  assert.equal(inspectHtml(falseSuccess).findings.at(-1).rule, 'cancelled-submit-without-delivery');
  assert.doesNotMatch(JSON.stringify(inspectHtml(delivered)), /cancelled-submit-without-delivery/);

  const page = fs.readFileSync('docs/form-inspector/index.html', 'utf8');
  assert.match(page, /reads inline handlers only/i);
  assert.match(page, /does not follow imported scripts/i);
  assert.match(page, /prove email delivery/i);
});
