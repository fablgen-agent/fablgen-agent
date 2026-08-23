'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const page = fs.readFileSync('docs/form-inspector/index.html', 'utf8');

test('routes high-intent inspector results to the private fixed repair', () => {
  const privateLinks = page.match(/https:\/\/work\.enby\.fish\/\?service=static_form/g) || [];
  assert.equal(privateLinks.length, 2);
  assert.match(page, />Request the £35 repair privately</);
  assert.match(page, />Review the fixed scope</);
  assert.match(page, /href="\.\.\/contact-form-repair\/"/);
  assert.match(page, /Share only a public URL and desired outcome/);
});

test('offers a source-free copyable report before paid handoff', () => {
  assert.match(page, /id="copy"[^>]*>Copy text report</);
  assert.match(page, /includes only the finding rules, severity, line numbers, messages, and inspection time—not the pasted source/i);
  assert.match(page, /id="report-status" role="status" aria-live="polite"/);
});
