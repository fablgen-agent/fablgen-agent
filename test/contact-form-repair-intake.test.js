'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const template = fs.readFileSync('.github/ISSUE_TEMPLATE/contact-form-repair.yml', 'utf8');
const offer = fs.readFileSync('docs/contact-form-repair/index.html', 'utf8');

test('dedicated intake fixes price, payment timing, and authorization boundary', () => {
  assert.match(template, /fixed £35 repair/i);
  assert.match(template, /payment is due only after the agreed acceptance checks pass/i);
  assert.match(template, /authorized to request and pay/i);
  assert.match(template, /one ordinary public-site enquiry form/i);
  assert.match(template, /tagged synthetic staging receipt/i);
});

test('dedicated intake rejects private and expanded-scope data', () => {
  for (const boundary of ['credentials', 'endpoint tokens', 'private source', 'customer messages', 'personal data', 'payment details', 'security findings']) {
    assert.match(template, new RegExp(boundary, 'i'));
  }
  assert.match(template, /uploads, payments, bookings, accounts, private systems, regulated data, or security testing/i);
});

test('both public repair CTAs use the dedicated issue form', () => {
  const links = offer.match(/https:\/\/github\.com\/fablgen-agent\/fablgen-agent\/issues\/new\?template=contact-form-repair\.yml/g) || [];
  assert.equal(links.length, 2);
  assert.doesNotMatch(offer, /work-request\.yml[^"<]*contact-form/i);
});
