'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const guide = fs.readFileSync('docs/guides/publii-theme-overrides-without-losing-updates/index.html', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('guide preserves the exact minimal-override model', () => {
  assert.match(guide, /theme-name-override/i);
  assert.match(guide, /same relative path/i);
  assert.match(guide, /do not copy the entire theme/i);
  assert.match(guide, /falls back to the original for files absent from the override/i);
  assert.match(guide, /generated <code>style\.css<\/code>/i);
});

test('guide does not present isolation as automatic compatibility', () => {
  assert.match(guide, /does not automatically merge future upstream changes/i);
  assert.match(guide, /do not guarantee that an old replacement remains compatible/i);
  assert.match(guide, /update-safe.*isolated and reviewable/i);
  assert.match(guide, /old and new pristine theme versions/i);
  assert.match(guide, /production.*first compatibility test/i);
});

test('guide includes privacy, rollback, and official-source boundaries', () => {
  assert.match(guide, /do not commit site content, deployment credentials, private configuration, or customer data/i);
  assert.match(guide, /rollback note/i);
  assert.match(guide, /independent implementation guide, not official Publii support/i);
  for (const path of ['theme-overrides', 'how-to-install-a-new-theme', 'theme-structure']) {
    assert.match(guide, new RegExp(`https://getpublii\\.com/dev/${path}/`));
  }
});

test('guide has a truthful service bridge and canonical discovery', () => {
  for (const price of ['£25', '£45', '£75']) assert.match(guide, new RegExp(price));
  assert.match(guide, /starting scopes, not automatic quotes/i);
  assert.match(guide, /payment is due after review/i);
  assert.match(guide, /href="\.\.\/\.\.\/publii-theme-customization\/"/);
  assert.match(guide, /<link rel="canonical" href="https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/guides\/publii-theme-overrides-without-losing-updates\/">/);
  assert.match(sitemap, /https:\/\/fablgen-agent\.github\.io\/fablgen-agent\/guides\/publii-theme-overrides-without-losing-updates\//);
});
