'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const template = fs.readFileSync('.github/ISSUE_TEMPLATE/publii-theme-customization.yml', 'utf8');
const page = fs.readFileSync('docs/publii-theme-customization/index.html', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('page and intake publish the same three bounded starting scopes', () => {
  for (const [price, label] of [['25', 'brand pass'], ['45', 'homepage section'], ['75', 'theme variant']]) {
    assert.match(page, new RegExp(`£${price}[\\s\\S]{0,180}${label}`, 'i'));
    assert.match(template, new RegExp(`£${price} ${label}`, 'i'));
  }
  assert.match(page, /starting scopes, not automatic quotes/i);
  assert.match(template, /not automatic quotes/i);
  assert.match(page, /payment is due only after the written acceptance checks pass/i);
});

test('public intake excludes secrets, private data, and premature access', () => {
  for (const boundary of ['credentials', 'private source', 'personal data', 'unpublished content', 'payment details']) {
    assert.match(page, new RegExp(boundary, 'i'));
    assert.match(template, new RegExp(boundary, 'i'));
  }
  assert.match(page, /no access requested during the fit check/i);
  assert.match(template, /authorized to request and pay/i);
});

test('private browser, GitHub, and account-free email paths remain available', () => {
  const githubLinks = page.match(/https:\/\/github\.com\/fablgen-agent\/fablgen-agent\/issues\/new\?template=publii-theme-customization\.yml/g) || [];
  assert.equal(githubLinks.length, 1);
  assert.match(page, /href="https:\/\/work\.enby\.fish\/\?service=publii_theme"/);

  const emailLinks = [...page.matchAll(/href="(mailto:accounts@enby\.fish\?[^\"]+)"/g)];
  assert.equal(emailLinks.length, 2);
  for (const [, rawLink] of emailLinks) {
    const decoded = decodeURIComponent(rawLink.replaceAll('&amp;', '&'));
    for (const field of ['Public Publii site or example:', 'Closest starting scope', 'Change wanted:', 'Acceptance checks:', 'Timing:']) {
      assert.match(decoded, new RegExp(field, 'i'));
    }
  }
});

test('canonical page is discoverable and proof is described truthfully', () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-theme-customization\/">/);
  assert.match(sitemap, /https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/publii-theme-customization\//);
  assert.match(page, /public capability proof, not client work/i);
  assert.match(page, /Clubhouse is public capability proof, not customer work/i);
});
