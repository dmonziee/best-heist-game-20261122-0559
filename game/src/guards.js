// Guards: they walk their patrol loop, watch with a vision cone, and hunt
// the thief's last seen position when the alarm runs hot. A guard that
// reaches the thief ends the run.

import { GUARD } from './config.js';
import { angleTo, coneSees, distance, insideShadow, insideSmoke } from './vision.js';

export function createGuard(def) {
  const start = def.waypoints[0];
  return {
    name: def.name,
    color: def.color,
    x: start.x,
    y: start.y,
    facing: 0,
    waypoints: def.waypoints,
    waypointIndex: 1,
    speed: def.speed,
    state: 'patrol', // patrol | hunt | wait
    waitLeft: 0,
    lastSeen: null,
    seeing: false,
    spot: 0,
  };
}

// Move one guard a step. Returns whether this guard can see the thief now.
export function updateGuard(guard, dt, player, blockers, shadows, smokes, alarmHot) {
  const playerHidden = insideSmoke(player, smokes);
  const inShadow = insideShadow(player, shadows);

  // Vision first: a guard only spots what its cone reaches.
  let spot = 0;
  if (!playerHidden) {
    spot = coneSees(
      guard, guard.facing, GUARD.viewRange, GUARD.viewHalfAngle, player, blockers,
    );
    if (spot > 0 && inShadow) spot *= 0.5;
  }
  guard.seeing = spot > 0;
  guard.spot = spot;

  if (spot > 0) guard.lastSeen = { x: player.x, y: player.y };

  // Hot alarm: abandon the patrol and converge on the last seen spot.
  if (alarmHot && guard.lastSeen) guard.state = 'hunt';
  if (!alarmHot && guard.state === 'hunt') guard.state = 'patrol';

  if (guard.state === 'hunt' && guard.lastSeen) {
    const target = guard.lastSeen;
    const d = distance(guard, target);
    if (d < 12) {
      guard.state = 'wait';
      guard.waitLeft = 1.4;
    } else {
      moveToward(guard, target, GUARD.huntSpeed, dt);
    }
  } else if (guard.state === 'wait') {
    guard.waitLeft -= dt;
    guard.facing += dt * 1.6;
    if (guard.waitLeft <= 0) {
      guard.state = 'patrol';
      guard.lastSeen = null;
    }
  } else {
    const target = guard.waypoints[guard.waypointIndex];
    const d = distance(guard, target);
    if (d < 8) {
      guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
    } else {
      moveToward(guard, target, guard.speed, dt);
    }
  }

  return spot;
}

function moveToward(guard, target, speed, dt) {
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.001) return;
  const step = Math.min(d, speed * dt);
  guard.x += (dx / d) * step;
  guard.y += (dy / d) * step;
  guard.facing = angleTo(guard, target);
}

// True when any guard is touching the thief.
export function guardTouched(player, guards) {
  return guards.some((g) => distance(g, player) < GUARD.touchRange);
}
