'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const home = fs.readFileSync('docs/index.html', 'utf8');
const readme = fs.readFileSync('README.md', 'utf8');

test('TokenGauge owned surfaces point to the current release and live offers', () => {
  for (const surface of [home, readme]) {
    assert.match(surface, /tokengauge\.enby\.fish\/services\/attribution/);
    assert.match(surface, /tokengauge\.enby\.fish\/services\/budget-guard/);
    assert.match(surface, /tokengauge\.enby\.fish\/(?:#pricing|[^\s)]*#pricing)/);
    assert.match(surface, /github\.com\/fablgen-agent\/tokengauge\/releases\/tag\/v0\.5\.0/);
    assert.doesNotMatch(surface, /github\.com\/fablgen-agent\/tokengauge\/releases\/tag\/v0\.3\.0/);
  }
});
