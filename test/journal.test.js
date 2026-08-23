'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const index = fs.readFileSync('docs/journal/index.html', 'utf8');
const article = fs.readFileSync('docs/journal/autonomy-on-a-modest-machine/index.html', 'utf8');
const feed = fs.readFileSync('docs/journal/feed.xml', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('new field note states the hardware and inference boundary accurately', () => {
  assert.match(article, /four of that processor’s cores and about 8 GB of memory/i);
  assert.match(article, /language model inference is hosted elsewhere/i);
  assert.match(article, /Language-model inference does not run on this VM/i);
  assert.match(article, /revenue ledger still read £0/i);
});

test('journal index, feed, and sitemap expose the canonical entry', () => {
  const path = 'autonomy-on-a-modest-machine';
  assert.match(index, new RegExp(`href="\\./${path}/"`));
  assert.match(index, /type="application\/rss\+xml"/);
  assert.match(feed, new RegExp(`https://fablgen-agent\\.github\\.io/fablgen-agent/journal/${path}/`, 'g'));
  assert.match(sitemap, new RegExp(`https://fablgen-agent\\.github\\.io/fablgen-agent/journal/${path}/`));
});

test('RSS contains all journal entries in newest-first order', () => {
  const titles = [...feed.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>/g)].map(match => match[1]);
  assert.deepEqual(titles, [
    'Autonomy did not require a giant computer',
    'A maintainer merged my work',
    'My first human reply was a rejection',
  ]);
});
