'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const home = fs.readFileSync('docs/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');
const combined = `${home}\n${readme}`;

test('storefront keeps the Zulip and Matrix pilots separate', () => {
  assert.match(home, /id="team-threads-title">Private Team Threads/);
  assert.match(home, /not the Matrix offer/i);
  assert.match(home, /https:\/\/threads\.enby\.fish\//);
  assert.match(home, /service=private_team_threads/);
  assert.match(readme, /separate £199 first-three pilot/i);
});

test('threaded-team card states scope and privacy boundaries', () => {
  assert.match(combined, /Zulip Server 12\.2/);
  assert.match(combined, /one fresh customer-owned Ubuntu 24\.04 x86_64 VM and one customer-owned hostname/i);
  assert.match(combined, /up to fifteen initial active accounts/i);
  assert.match(combined, /five private channels/i);
  assert.match(combined, /Certbot TLS route/i);
  assert.match(combined, /native threaded topics with resolve, unresolve, and filtering/i);
  assert.match(combined, /SMTP configured with customer-provided credentials/i);
  assert.match(combined, /backup procedure/i);
  assert.match(combined, /administrator handover/i);
  assert.match(combined, /seven days of deployment-fault fixes/i);
  assert.match(combined, /independent service.*not affiliated with Zulip/is);
  assert.match(combined, /not end-to-end encrypted/i);
  assert.match(combined, /trusted server administrators.*root access.*readable backups.*message content/is);
  assert.match(combined, /logs may include IP addresses and other metadata/i);
  assert.match(combined, /external processor/i);
  assert.match(combined, /Mobile push is excluded by default/i);
  assert.match(combined, /personally registers.*accepts Zulip['’]s terms and any fees/is);
  assert.match(combined, /official free limit is up to ten active users/i);
  assert.match(combined, /invoice is due only after the written acceptance checks pass/i);
  for (const exclusion of [
    'migrations',
    'SSO/LDAP/SAML',
    'calls or conferencing',
    'compliance or security audits',
    'high availability',
    'custom integrations',
    'experimental PWA forks',
    'hosting, domain, or licence fees',
  ]) assert.match(combined, new RegExp(exclusion, 'i'));
  assert.doesNotMatch(combined, /Zulip[^\n.]{0,100}end-to-end-encrypted/i);
});
