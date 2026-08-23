'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const offer = fs.readFileSync('docs/booking-selection-repair/index.html', 'utf8');
const template = fs.readFileSync('.github/ISSUE_TEMPLATE/booking-selection-repair.yml', 'utf8');
const home = fs.readFileSync('docs/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const sitemap = fs.readFileSync('docs/sitemap.xml', 'utf8');

test('booking repair publishes one exact fixed scope and payment boundary', () => {
  assert.match(offer, /£75 fixed after a written fit check/i);
  assert.match(offer, /one reproducible availability or booking-selection defect/i);
  assert.match(offer, /no order, payment, or customer record is created/i);
  assert.match(offer, /due only after every agreed check passes/i);
  assert.match(offer, /unsupported paid licence or third-party platform change/i);
});

test('booking repair has private, public, and account-free intake routes', () => {
  const privateLinks = offer.match(/https:\/\/work\.enby\.fish\/\?service=booking_selection/g) || [];
  assert.equal(privateLinks.length, 2);
  assert.match(offer, /issues\/new\?template=booking-selection-repair\.yml/);
  assert.match(offer, /mailto:accounts@enby\.fish\?subject=Fixed%20%C2%A375%20booking-selection%20repair/);
  assert.match(home, /href="\.\/booking-selection-repair\/"/);
  assert.match(readme, /booking-selection-repair\//);
  assert.match(sitemap, /booking-selection-repair\/<\/loc>[\s\S]*?<lastmod>2026-08-23<\/lastmod>/);
});

test('structured intake enforces authority, staging, and sensitive-data exclusions', () => {
  assert.match(template, /authorized to request and pay/i);
  assert.match(template, /one existing licensed integration and one product, service, or location/i);
  assert.match(template, /without a real order, payment, or customer record/i);
  assert.match(template, /fixed price is £75, due only after the written acceptance checks pass/i);
  for (const boundary of ['credentials', 'private source', 'licence keys', 'booking/customer records', 'personal or health data', 'payment details', 'security findings']) {
    assert.match(template, new RegExp(boundary, 'i'));
  }
});

test('offer does not imply client work, conversions, or completed checkout', () => {
  assert.match(offer, /No prior booking customer, conversion result, or revenue is implied/i);
  assert.doesNotMatch(offer, /case study|client result|conversion increase|guaranteed bookings/i);
  assert.match(offer, /stops? before (?:checkout completion|an order or payment)|existing checkout handoff/i);
});
