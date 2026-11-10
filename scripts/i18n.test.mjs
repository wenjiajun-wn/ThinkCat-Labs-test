import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {preferredLanguage,localized} from '../config/i18n.ts';
test('saved choice takes precedence over browser detection', () => {
  assert.equal(preferredLanguage('en','zh-CN'),'en');
  assert.equal(preferredLanguage('zh','en-US'),'zh');
});
test('Chinese browser variants select Chinese, other variants default to English', () => {
  for (const browser of ['zh','zh-CN','zh-SG','zh-Hant']) assert.equal(preferredLanguage(null,browser),'zh');
  for (const browser of ['en-US','fr-FR','']) assert.equal(preferredLanguage('invalid',browser),'en');
});
test('localized routes preserve trailing slash', () => {
  assert.equal(localized('en','products'),'/en/products/');
  assert.equal(localized('zh'),'/zh/');
});
