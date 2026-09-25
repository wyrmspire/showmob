import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const content = new URL('../app/src/content/', import.meta.url);

function artifact(slug) {
  return JSON.parse(readFileSync(new URL(`${slug}.json`, content), 'utf8'));
}

function block(page, id) {
  const found = page.blocks.find((candidate) => candidate.id === id);
  assert.ok(found, `${page.slug}: missing block ${id}`);
  return found;
}

function text(page) {
  return JSON.stringify(page);
}

test('the facing exercise delivers exactly 20 internally explained program lines', () => {
  const page = artifact('gn-g-code-fundamentals-reading-a-20-line-facing-program-line-by-line');
  const lines = block(page, 'program').code.split('\n');
  assert.equal(lines.length, 20);
  assert.match(block(page, 'walk-passes').heading, /Every line/);
  assert.equal(block(page, 'walk-passes').rows.length, 20);
  assert.match(text(page), /SIMULATION ONLY/);
});

test('the OEE board reproduces every displayed value from raw counts', () => {
  const page = artifact('gn-live-oee-dashboard-for-a-3-machine-cnc-cell-example-data');
  const rows = block(page, 'machines').rows;
  let runTotal = 0;
  let partTotal = 0;
  let goodTotal = 0;

  for (const row of rows) {
    const run = Number(row[1]);
    const [total, good] = row[2].split('/').map(Number);
    assert.ok(good <= total && total <= run && run <= 180);
    assert.equal(row[4], `${(good / 180 * 100).toFixed(1)}%`);
    runTotal += run;
    partTotal += total;
    goodTotal += good;
  }

  const stats = block(page, 'cell-oee').items;
  assert.equal(stats[0].value, `${(goodTotal / 540 * 100).toFixed(1)}%`);
  assert.equal(stats[1].value, `${(runTotal / 540 * 100).toFixed(1)}%`);
  assert.equal(stats[2].value, `${(partTotal / runTotal * 100).toFixed(1)}%`);
  assert.equal(stats[3].value, `${(goodTotal / partTotal * 100).toFixed(1)}%`);
});

test('high-consequence procedures defer to equipment-specific rules and cite primary guidance', () => {
  const capacitor = artifact('gn-conflicting-advice-on-whether-it-s-safe-to-discharge-a-capacitor-with-a-screwdriver');
  const loto = artifact('gn-lockout-tagout-the-full-procedure-and-why-each-step-exists');
  const jump = artifact('gn-steps-to-jump-start-a-car-with-cables');

  assert.match(text(capacitor), /Do not short a capacitor with a screwdriver/);
  assert.doesNotMatch(text(capacitor), /few kilohms|cover every case/);
  assert.match(text(capacitor), /osha\.gov/);

  assert.match(text(loto), /machine-specific/);
  assert.match(text(loto), /osha\.gov/);
  assert.doesNotMatch(text(loto), /Each person working on the machine applies their own personal lock and tag to every isolation point/);

  assert.match(text(jump), /instructions for both vehicles/);
  assert.match(text(jump), /designated ground point/);
  assert.match(text(jump), /ford\.com|fordservicecontent\.com/);
  assert.doesNotMatch(text(jump), /Five more minutes of charging.*fixes most/);
});

test('technical teaching labels model limits instead of presenting vendor behavior as universal', () => {
  const plc = artifact('gn-the-plc-scan-cycle-and-why-timers-and-one-shots-misbehave');
  assert.match(text(plc), /simplified cyclic model/i);
  assert.match(text(plc), /asynchronously|multiple tasks/);
  assert.match(text(plc), /rockwellautomation\.com/);
  assert.doesNotMatch(text(plc), /Nothing inside the program touches the real world mid-scan/);
});

test('operational examples keep lifecycle and scheduling dimensions honest', () => {
  const pm = artifact('gn-preventive-maintenance-schedule-that-updates-as-tasks-close');
  const status = artifact('gn-showmob-artifact-status-board-draft-in-pr-published');
  const agenda = artifact('gn-tomorrow-three-meetings-a-dentist-appointment-and-a-4-hour-focus-block-a');

  assert.match(text(pm), /Completion-based/);
  assert.match(text(pm), /Fixed-calendar/);
  assert.match(text(pm), /Usage-based/);
  assert.doesNotMatch(text(pm), /Forklift/);

  assert.match(block(status, 'start').body, /four artifact lifecycle states/);
  assert.match(block(status, 'start').body, /PR state is a separate workflow dimension/);
  assert.match(block(status, 'board').caption, /preview pages stay unlisted but remain viewable by direct link/);

  // The prompt asked for a 4-hour focus block: the agenda protects one
  // uninterrupted block and never splits it into two halves.
  assert.match(block(agenda, 'protect').body, /one four-hour stretch/);
  assert.doesNotMatch(text(agenda), /Focus block [AB]/);
  assert.match(text(agenda), /14:50–18:50/);
});
