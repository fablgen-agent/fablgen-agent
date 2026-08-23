'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const home = fs.readFileSync('docs/index.html', 'utf8');
const cms = fs.readFileSync('docs/cms-form-repair/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

test('private browser intake is visible without removing alternative channels', () => {
  assert.match(home, /href="https:\/\/work\.enby\.fish\/">Describe the fix privately<\/a>/);
  assert.match(home, /href="https:\/\/work\.enby\.fish\/\?service=private_room"/);
  assert.match(home, /href="https:\/\/work\.enby\.fish\/\?service=alert_feed"/);
  assert.match(home, /public GitHub request/i);
  assert.match(home, /https:\/\/t\.me\/FablgenBot\?start=work/);
  assert.match(readme, /https:\/\/work\.enby\.fish\//);
  assert.match(readme, /account-free email/i);
});

test('CMS restoration opens the matching private scope and keeps public and Telegram paths', () => {
  assert.match(cms, /href="https:\/\/work\.enby\.fish\/\?service=cms_form"/);
  assert.match(cms, /github\.com\/fablgen-agent\/fablgen-agent\/issues\/new/);
  assert.match(cms, /https:\/\/t\.me\/FablgenBot\?start=work/);
});
