import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sha256Hex,
  hashPin,
  verifyPin,
  encryptPayload,
  decryptPayload,
  sanitizeString,
  isServiceRoleKey,
  validateImportedJson,
  isValidUUID,
} from './security';

test('SHA-256 and salted PIN hashing', async () => {
  const hash = await sha256Hex('1234');
  assert.equal(typeof hash, 'string');
  assert.equal(hash.length, 64);

  const salt = 'random_salt_123';
  const pinHash = await hashPin('1234', salt);
  const isValid = await verifyPin('1234', salt, pinHash);
  const isInvalid = await verifyPin('9999', salt, pinHash);

  assert.equal(isValid, true);
  assert.equal(isInvalid, false);
});

test('encryptPayload and decryptPayload preserve data roundtrip', () => {
  const original = JSON.stringify([{ id: 'tx-1', amount: 1200, note: 'Confidential' }]);
  const secretKey = 'vault-key-abc';

  const encrypted = encryptPayload(original, secretKey);
  assert.notEqual(encrypted, original);

  const decrypted = decryptPayload(encrypted, secretKey);
  assert.equal(decrypted, original);
});

test('sanitizeString strips HTML tags and control chars', () => {
  const dangerous = '<script>alert("hack")</script>Dinner at <b>Bistro</b>\x00';
  const sanitized = sanitizeString(dangerous);
  assert.equal(sanitized, 'alert("hack")Dinner at Bistro');
});

test('isServiceRoleKey intercepts leaked Supabase secret keys', () => {
  assert.equal(isServiceRoleKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.sig'), true);
  assert.equal(isServiceRoleKey('sb_secret_service_role_key_123'), true);
  assert.equal(isServiceRoleKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig'), false);
  assert.equal(isServiceRoleKey(''), false);
});

test('validateImportedJson rejects oversized files and prototype pollution', () => {
  // Prototype pollution attack payload
  const maliciousPayload = '{"__proto__": {"admin": true}}';
  const maliciousResult = validateImportedJson(maliciousPayload);
  assert.equal(maliciousResult.valid, false);
  assert.match(maliciousResult.error || '', /prototype pollution/i);

  // Valid payload
  const validPayload = JSON.stringify([
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      date: '2026-10-10',
      type: 'expense',
      amount: 450,
      currency: 'THB',
      category: 'food_meals',
      wastage_tag: 'essential',
      note: 'Normal lunch',
    },
  ]);

  const validResult = validateImportedJson(validPayload);
  assert.equal(validResult.valid, true);
  assert.equal(validResult.transactions.length, 1);
  assert.equal(validResult.transactions[0].amount, 450);
});

test('isValidUUID validates RFC4122 UUID v4', () => {
  assert.equal(isValidUUID('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isValidUUID('not-a-uuid'), false);
  assert.equal(isValidUUID(''), false);
});
