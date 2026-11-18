import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('lib/i18n/messages.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(`(function(module,exports){${code}})`)(mod, mod.exports);
const { createTranslator, english } = mod.exports;
const en = createTranslator('en'), th = createTranslator('th');

test('both directions translate UI without changing IDs, names or React values', () => {
  assert.equal(en('การจองของฉัน'), 'My bookings');
  assert.equal(th('Dashboard'), 'ภาพรวม');
  assert.equal(th('การจองของฉัน'), 'การจองของฉัน');
  assert.equal(en('สวัสดี นักศึกษา'), 'Hello นักศึกษา');
  assert.equal(en('E1-C-003'), 'E1-C-003');
  assert.equal(en(35), 35);
  const element = { type: 'div' }; assert.equal(en(element), element);
});
test('persisted notification messages and booking errors translate at display time', () => {
  assert.equal(en('โซน E1 ใกล้เต็ม'), 'Zone E1 Nearly full');
  assert.equal(en('E1-C-001 • ดูช่วงเวลาที่จองได้ใน My Booking'), 'E1-C-001 • View the reserved time in My Booking');
  assert.equal(en('พร้อมจองตอนนี้ 12 จาก 90 ช่อง (รวมผลการจองปัจจุบัน)'), '12 of 90 spaces available now (including current bookings)');
  assert.equal(en('บทบาทนี้จองได้ครั้งละไม่เกิน 60 นาที'), 'This role can book up to 60 minutes at a time.');
  assert.equal(en(' มีข้อมูล 7/7 โซน '), ' Data available for 7/7 zones ');
});
test('every English dictionary entry has no Thai residue and matches its template', () => {
  for (const [key, value] of Object.entries(english)) {
    assert.equal(/[ก-๙]/.test(value), false, key);
    const sample = key.replace(/\{(\d+)\}/g, (_, i) => `value${i}`);
    assert.equal(en(sample), value.replace(/\{(\d+)\}/g, (_, i) => `value${i}`), key);
  }
});
