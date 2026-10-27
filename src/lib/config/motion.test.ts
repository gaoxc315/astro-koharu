import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_CLICK_BURST_PETALS,
  DEFAULT_SECTION_BLOOM,
  isMotionLevel,
  MOTION_DEFAULTS,
  normalizeMotionConfig,
} from './motion';

test('an absent section resolves to the lively defaults', () => {
  assert.deepEqual(normalizeMotionConfig(undefined), MOTION_DEFAULTS);
  assert.deepEqual(normalizeMotionConfig(null), MOTION_DEFAULTS);
  assert.deepEqual(normalizeMotionConfig({}), MOTION_DEFAULTS);
  assert.equal(MOTION_DEFAULTS.level, 'lively');
});

test('defaults are applied per field', () => {
  const resolved = normalizeMotionConfig({ level: 'subtle' });
  assert.equal(resolved.level, 'subtle');
  assert.equal(resolved.heroPetals, true);
  assert.equal(resolved.clickBurst, true);
});

test('explicit false disables the sakura effects', () => {
  const resolved = normalizeMotionConfig({ heroPetals: false, clickBurst: false });
  assert.equal(resolved.heroPetals, false);
  assert.equal(resolved.clickBurst, false);
});

test('unknown levels and wrongly typed flags fall back to the default', () => {
  const resolved = normalizeMotionConfig({ level: 'wild', heroPetals: 'yes', clickBurst: 1 } as never);
  assert.deepEqual(resolved, MOTION_DEFAULTS);
});

test('isMotionLevel accepts exactly the three levels', () => {
  for (const level of ['lively', 'subtle', 'reduced']) assert.equal(isMotionLevel(level), true);
  for (const value of ['off', '', null, undefined, 1]) assert.equal(isMotionLevel(value), false);
});

test('click petals and section blooms accept one svg/gif or a list, and reject anything else', () => {
  const resolved = normalizeMotionConfig({
    clickBurstPetal: [' /img/effects/custom.svg ', 'https://cdn.example.com/petal.gif?v=1', '/img/nope.png', '../secret.svg'],
    sectionBloom: 'img/effects/bloom.gif',
    footerBloom: 'https://cdn.example.com/footer.gif',
    heroPetal: [' /img/effects/snow.svg ', 'https://cdn.example.com/flake.gif'],
    tocPetal: 'img/effects/mark.svg',
  });
  assert.deepEqual(resolved.clickBurstPetals, ['/img/effects/custom.svg', 'https://cdn.example.com/petal.gif?v=1']);
  assert.equal(resolved.sectionBloom, '/img/effects/bloom.gif');
  assert.equal(resolved.footerBloom, 'https://cdn.example.com/footer.gif');
  assert.deepEqual(resolved.heroPetalSources, ['/img/effects/snow.svg', 'https://cdn.example.com/flake.gif']);
  assert.equal(resolved.tocPetal, '/img/effects/mark.svg');

  const single = normalizeMotionConfig({ clickBurstPetal: 'https://cdn.example.com/one.svg#petal' });
  assert.deepEqual(single.clickBurstPetals, ['https://cdn.example.com/one.svg#petal']);
  assert.deepEqual(single.heroPetalSources, []);
});

test('an empty decoration value keeps the built-in shape, and a bad bloom path keeps the default file', () => {
  const cleared = normalizeMotionConfig({
    clickBurstPetal: '',
    sectionBloom: '',
    footerBloom: '',
    heroPetal: '',
    tocPetal: '',
  });
  assert.deepEqual(cleared.clickBurstPetals, []);
  assert.equal(cleared.sectionBloom, '');
  assert.equal(cleared.footerBloom, '');
  assert.deepEqual(cleared.heroPetalSources, []);
  assert.equal(cleared.tocPetal, '');

  const listed = normalizeMotionConfig({ clickBurstPetal: [] });
  assert.deepEqual(listed.clickBurstPetals, []);

  const rejected = normalizeMotionConfig({
    sectionBloom: 'javascript:alert(1)',
    footerBloom: 'javascript:alert(1)',
    heroPetal: 'javascript:alert(1)',
    tocPetal: 'javascript:alert(1)',
  });
  assert.equal(rejected.sectionBloom, DEFAULT_SECTION_BLOOM);
  assert.equal(rejected.footerBloom, '');
  assert.deepEqual(rejected.heroPetalSources, []);
  assert.equal(rejected.tocPetal, '');
});

test('the default decoration files are the ones site.yaml points at', () => {
  const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public');
  for (const asset of [...DEFAULT_CLICK_BURST_PETALS, DEFAULT_SECTION_BLOOM]) {
    assert.equal(fs.existsSync(path.join(publicDir, asset)), true, asset);
  }
});
