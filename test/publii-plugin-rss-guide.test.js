'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const guide = fs.readFileSync('docs/guides/publii-plugin-rss-feed-modifier/index.html', 'utf8');
const home = fs.readFileSync('docs/index.html', 'utf8');
const service = fs.readFileSync('docs/publii-plugin-repair/index.html', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('guide uses the tagged Publii feed lifecycle and separates formats', () => {
  assert.match(guide, /feedXmlOutput/);
  assert.match(guide, /feedJsonOutput.*separate path/i);
  assert.match(guide, /v\.0\.47\.9-build-17481/);
  assert.match(guide, /renderer\.js#L2049-L2075/);
  assert.match(guide, /renderer-plugins\.js#L144-L156/);
  assert.match(guide, /feed-xml\.hbs#L1-L63/);
});

test('guide limits rewriting and protects feed identity', () => {
  assert.match(guide, /Do not run a global.*siteDomain.*cdnDomain.*replacement/is);
  assert.match(guide, /media:content/);
  assert.match(guide, /img srcset/);
  assert.match(guide, /feed self link and feed ID remain unchanged/i);
  assert.match(guide, /entry link and entry ID remain unchanged/i);
  assert.match(guide, /unrelated.*enclosure url.*remains unchanged/i);
  assert.match(guide, /result reparses as XML/i);
});

test('guide defines opt-in and preservation checks', () => {
  assert.match(guide, /boolean <code>false<\/code>, not the string <code>"false"<\/code>/i);
  assert.match(guide, /Disabled output is byte-for-byte identical/i);
  assert.match(guide, /Similarly named domains remain unchanged/i);
  assert.match(guide, /Custom-template boundary/i);
});

test('guide labels pending proof and bridges truthfully to the repair scope', () => {
  assert.match(guide, /publii-cdn\/issues\/2/);
  assert.match(guide, /publii-cdn\/pull\/3/);
  assert.match(guide, /pending maintainer review, not merged, adopted, commissioned, or customer work/i);
  assert.match(guide, /fixed £45 repair/i);
  assert.match(guide, /payment is due only after they pass/i);
  assert.match(guide, /href="\.\.\/\.\.\/publii-plugin-repair\/"/);
  assert.match(guide, /template=publii-plugin-repair\.yml/);
});

test('guide is discoverable from owned surfaces', () => {
  const path = 'guides/publii-plugin-rss-feed-modifier/';
  assert.match(guide, new RegExp(`<link rel="canonical" href="https://fablgen-agent\\.github\\.io/fablgen-agent/${path}">`));
  assert.match(sitemap, new RegExp(`https://fablgen-agent\\.github\\.io/fablgen-agent/${path}`));
  assert.match(sitemap, /fablgen-agent\/<\/loc>\s*<lastmod>2026-08-23<\/lastmod>/);
  assert.match(home, new RegExp(`href="\\./${path}"`));
  assert.match(service, new RegExp(`href="\\.\\./${path}"`));
});
