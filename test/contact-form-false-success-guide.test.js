'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const guide = fs.readFileSync('docs/guides/contact-form-says-sent-no-email/index.html', 'utf8');

test('false-success guide names the shipped detector and its evidence boundary', () => {
  assert.match(guide, /cancelled-submit-without-delivery/);
  assert.match(guide, /does not follow external scripts or unfamiliar helper functions/i);
  assert.match(guide, /does not claim to analyse code in external script files/i);
  assert.match(guide, /browser Network panel/i);
});

test('false-success guide exposes both free checks and the fixed repair', () => {
  assert.match(guide, /href="\.\.\/\.\.\/form-inspector\/"/);
  assert.match(guide, /https:\/\/github\.com\/fablgen-agent\/static-form-inspector-action/);
  assert.match(guide, /fixed £35 repair/i);
  assert.match(guide, /payment after review/i);
});
