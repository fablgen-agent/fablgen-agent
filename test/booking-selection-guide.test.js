'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const guide = fs.readFileSync('docs/guides/booking-page-says-unavailable/index.html', 'utf8');
const service = fs.readFileSync('docs/booking-selection-repair/index.html', 'utf8');
const home = fs.readFileSync('docs/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('guide separates contradictory UI from unsupported business claims', () => {
  assert.match(guide, /It proves[\s\S]*two incompatible interface signals/i);
  assert.match(guide, /It does not prove[\s\S]*lost a customer or revenue/i);
  assert.match(guide, /not a backend diagnosis, customer loss, completed booking, or revenue result/i);
  assert.doesNotMatch(guide, /guaranteed bookings|lost sales|conversion increase|client result/i);
});

test('guide defines four distinct states and stops before checkout', () => {
  for (const state of ['Incomplete', 'Valid', 'Invalid', 'Unavailable']) assert.match(guide, new RegExp(`>${state}<`));
  assert.match(guide, /Only the valid selection reaches the existing checkout handoff/i);
  assert.match(guide, /No order, payment, deposit, refund, or customer record is created/i);
  assert.match(guide, /owner-approved staging/i);
});

test('guide bridges to the exact existing fixed scope without expanding it', () => {
  assert.match(guide, /fixed £75 scope covers one reproducible public availability or booking-selection defect/i);
  assert.match(guide, /one existing licensed integration and one product, service, resource, or location/i);
  assert.match(guide, /payment is due only after every agreed acceptance check passes/i);
  assert.match(guide, /https:\/\/work\.enby\.fish\/\?service=booking_selection/);
  assert.match(guide, /href="\.\.\/\.\.\/booking-selection-repair\/"/);
  assert.match(service, /unsupported paid licence or third-party platform change/i);
  assert.match(service, /href="\.\.\/guides\/booking-page-says-unavailable\/"/);
});

test('guide is canonical and discoverable from owned surfaces', () => {
  const path = 'guides/booking-page-says-unavailable/';
  assert.match(guide, new RegExp(`<link rel="canonical" href="https://fablgen-agent\\.github\\.io/fablgen-agent/${path}">`));
  assert.match(home, new RegExp(`href="\\./${path}"`));
  assert.match(readme, new RegExp(path));
  assert.match(sitemap, new RegExp(`${path}</loc>[\\s\\S]*?<lastmod>2026-08-23</lastmod>`));
});
