// The alarm meter: 0 is silent, 100 is a lockdown. It climbs while any
// detector has eyes on the thief and falls back while the thief stays
// hidden. Past the hunt line the guards stop patrolling and converge.
// rateMul lets the difficulty setting scale how fast a sighting fills it.

import { ALARM } from './config.js';

export function createAlarm() {
  return { value: 0, max: 0, hottest: 0, rateMul: 1 };
}

// spotRate is the strongest detector's closeness (0..1) this frame, or 0
// when nothing sees the thief. Sprinting makes the rise faster.
export function updateAlarm(alarm, dt, spotRate, sprinting) {
  if (spotRate > 0) {
    let rate = ALARM.spotRate * spotRate * (alarm.rateMul || 1);
    if (sprinting) rate *= ALARM.sprintFactor;
    alarm.value += rate * dt;
  } else {
    alarm.value -= ALARM.decayPerSecond * dt;
  }
  alarm.value = Math.max(0, Math.min(ALARM.max, alarm.value));
  if (alarm.value > alarm.max) alarm.max = alarm.value;
  alarm.hottest = spotRate;
  return alarm.value >= ALARM.max;
}

export function tripCaseAlarm(alarm) {
  alarm.value = Math.min(ALARM.max, alarm.value + ALARM.caseTrip);
  if (alarm.value > alarm.max) alarm.max = alarm.value;
}

export function tripVaultAlarm(alarm) {
  alarm.value = Math.min(ALARM.max, alarm.value + ALARM.vaultTrip);
  if (alarm.value > alarm.max) alarm.max = alarm.value;
}

export function isHunting(alarm) {
  return alarm.value >= ALARM.huntAt;
}
