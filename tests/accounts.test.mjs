import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { emptyWeek, mondayLocal, validWeek } from '../app/src/activity.ts';
const sql = readFileSync(new URL('../supabase/migrations/20260928131000_account_activity.sql', import.meta.url), 'utf8');
test('week starts Monday in local calendar and accepts only seven safe days', () => {
  assert.equal(mondayLocal(new Date(2026, 8, 28, 23)), '2026-09-28');
  assert.equal(mondayLocal(new Date(2026, 9, 4, 23)), '2026-09-28');
  assert.equal(mondayLocal(new Date(2026, 9, 5, 1)), '2026-10-05');
  assert.equal(validWeek(emptyWeek()), true);
  assert.equal(validWeek([{ minutes: 0, strength: false }]), false);
  assert.equal(validWeek([...emptyWeek().slice(0, 6), { minutes: 1441, strength: false }]), false);
});
test('account SQL requires a verified inbox for admin and owner-only RLS', () => {
  assert.match(sql, /new\.email_confirmed_at is not null/);
  assert.match(sql, /values \(new\.id, false\)/);
  assert.match(sql, /create policy "owner reads activity"[\s\S]*auth\.uid\(\)\) = user_id/);
  assert.match(sql, /create policy "owner inserts activity"[\s\S]*auth\.uid\(\)\) = user_id/);
  assert.match(sql, /create policy "owner updates activity"[\s\S]*auth\.uid\(\)\) = user_id/);
  assert.match(sql, /grant select on public\.showmob_profiles to authenticated/);
  assert.doesNotMatch(sql, /grant (insert|update) on public\.showmob_profiles to authenticated/);
});
