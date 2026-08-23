'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const template = fs.readFileSync('.github/ISSUE_TEMPLATE/publii-plugin-repair.yml', 'utf8');
const page = fs.readFileSync('docs/publii-plugin-repair/index.html', 'utf8');
const home = fs.readFileSync('docs/index.html', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('page and intake publish the same bounded £45 repair scope', () => {
  for (const copy of ['fixed £45 repair', 'one reproducible defect', 'one existing Publii plugin', 'one supported Publii version']) {
    assert.match(page, new RegExp(copy, 'i'));
    assert.match(template, new RegExp(copy, 'i'));
  }
  assert.match(page, /payment is due only after the written acceptance checks pass/i);
  assert.match(template, /payment is due only after the written acceptance checks pass/i);
});

test('page and intake publish the same bounded £75 feature scope', () => {
  for (const copy of ['fixed £75 focused feature', 'one existing Publii plugin', 'one supported Publii version']) {
    assert.match(page, new RegExp(copy, 'i'));
    assert.match(template, new RegExp(copy, 'i'));
  }
  assert.match(page, /one bounded configuration, modifier, event, or output behavior/i);
  assert.match(template, /£75 — add one focused feature to an existing plugin/i);
  assert.match(page, /£75 route is shared only after acceptance/i);
  assert.match(page, /never used for a deposit or unspecified work/i);
});

test('public intake excludes secrets, sensitive data, and expanded scope', () => {
  for (const boundary of ['credentials', 'private source', 'site exports', 'personal data', 'unpublished content', 'payment details', 'security findings']) {
    assert.match(page, new RegExp(boundary, 'i'));
    assert.match(template, new RegExp(boundary, 'i'));
  }
  assert.match(page, /new plugin from scratch/i);
  assert.match(page, /multiple unrelated defects or features/i);
  assert.match(page, /Publii core changes/i);
  assert.match(template, /authorized to request and pay/i);
});

test('both account-free paths ask for the minimum public change fields', () => {
  const issueLinks = page.match(/https:\/\/github\.com\/fablgen-agent\/fablgen-agent\/issues\/new\?template=publii-plugin-repair\.yml/g) || [];
  assert.equal(issueLinks.length, 2);

  const emailLinks = [...page.matchAll(/href="(mailto:accounts@enby\.fish\?[^\"]+)"/g)];
  assert.equal(emailLinks.length, 2);
  for (const [, rawLink] of emailLinks) {
    const decoded = decodeURIComponent(rawLink.replaceAll('&amp;', '&'));
    for (const field of ['Request type (£45 repair or £75 focused feature):', 'Public plugin or reproduction:', 'Publii version:', 'Current behaviour:', 'Requested result:', 'Acceptance checks:', 'Timing:']) {
      assert.ok(decoded.toLowerCase().includes(field.toLowerCase()), `missing email field: ${field}`);
    }
  }
});

test('service is discoverable and public proof is labelled truthfully', () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-plugin-repair\/">/);
  assert.match(sitemap, /https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-plugin-repair\//);
  assert.match(home, /href="\.\/publii-plugin-repair\/"/);
  assert.match(page, /pending upstream review/i);
  assert.match(page, /not merged, adopted, commissioned, or customer work/i);
  assert.match(page, /github\.com\/x6c-co\/publii-cdn\/pull\/3/);
});

test('storefront matches the current Private Client Room scope', () => {
  assert.match(home, /up to fifteen initial accounts and three rooms/i);
  assert.match(home, /federation disabled by default/i);
  assert.doesNotMatch(home, /up to ten initial accounts/i);
});
