'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const template = fs.readFileSync('.github/ISSUE_TEMPLATE/publii-plugin-repair.yml', 'utf8');
const page = fs.readFileSync('docs/publii-plugin-repair/index.html', 'utf8');
const home = fs.readFileSync('docs/index.html', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('page and intake publish the same bounded £45 scope', () => {
  for (const copy of ['fixed £45 repair', 'one reproducible defect', 'one existing Publii plugin', 'one supported Publii version']) {
    assert.match(page, new RegExp(copy, 'i'));
    assert.match(template, new RegExp(copy, 'i'));
  }
  assert.match(page, /payment is due only after the written acceptance checks pass/i);
  assert.match(template, /payment is due only after the written acceptance checks pass/i);
});

test('public intake excludes secrets, sensitive data, and expanded scope', () => {
  for (const boundary of ['credentials', 'private source', 'site exports', 'personal data', 'unpublished content', 'payment details', 'security findings']) {
    assert.match(page, new RegExp(boundary, 'i'));
    assert.match(template, new RegExp(boundary, 'i'));
  }
  assert.match(page, /new plugin from scratch/i);
  assert.match(page, /Publii core changes/i);
  assert.match(template, /authorized to request and pay/i);
});

test('both account-free paths ask for the minimum public reproduction fields', () => {
  const issueLinks = page.match(/https:\/\/github\.com\/fablgen-agent\/fablgen-agent\/issues\/new\?template=publii-plugin-repair\.yml/g) || [];
  assert.equal(issueLinks.length, 2);

  const emailLinks = [...page.matchAll(/href="(mailto:accounts@enby\.fish\?[^\"]+)"/g)];
  assert.equal(emailLinks.length, 2);
  for (const [, rawLink] of emailLinks) {
    const decoded = decodeURIComponent(rawLink.replaceAll('&amp;', '&'));
    for (const field of ['Public plugin or reproduction:', 'Publii version:', 'Reproduction:', 'Expected result:', 'Acceptance checks:', 'Timing:']) {
      assert.match(decoded, new RegExp(field, 'i'));
    }
  }
});

test('service is discoverable and public proof is labelled truthfully', () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-plugin-repair\/">/);
  assert.match(sitemap, /https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-plugin-repair\//);
  assert.match(home, /href="\.\/publii-plugin-repair\/"/);
  assert.match(page, /pending upstream review/i);
  assert.match(page, /not merged, adopted, or customer work/i);
});

test('storefront matches the current Private Client Room scope', () => {
  assert.match(home, /up to fifteen initial accounts and three rooms/i);
  assert.match(home, /federation disabled by default/i);
  assert.doesNotMatch(home, /up to ten initial accounts/i);
});
