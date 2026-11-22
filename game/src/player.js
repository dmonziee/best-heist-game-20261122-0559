// The thief: movement with wall collision, the lockpick on the glass
// case, the timed crack on the vault, and two tools that cost score —
// a smoke pellet and an EMP pulse.

import { PLAYER, TOOLS } from './config.js';
import { PEDESTAL, VAULT } from './level.js';
import { distance } from './vision.js';

export function createPlayer(entry) {
  return {
    x: entry.x,
    y: entry.y,
    radius: PLAYER.radius,
    dir: -Math.PI / 2,
    sprinting: false,
    moving: false,
    smokeUses: PLAYER.smokeUses,
    empUses: PLAYER.empUses,
    lockpick: 0,
    hasLoot: false,
    vaultPick: 0,
    hasVault: false,
    noiseRing: 0,
  };
}

// Circle against a rectangle: push the circle out along the shallowest axis.
function resolveCircleRect(p, rect) {
  const cx = Math.max(rect.x, Math.min(p.x, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(p.y, rect.y + rect.h));
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= p.radius * p.radius) return;
  if (d2 > 0.0001) {
    const d = Math.sqrt(d2);
    p.x = cx + (dx / d) * p.radius;
    p.y = cy + (dy / d) * p.radius;
  } else {
    // Centre inside the rectangle: push out along the smallest overlap.
    const left = p.x - rect.x + p.radius;
    const right = rect.x + rect.w - p.x + p.radius;
    const top = p.y - rect.y + p.radius;
    const bottom = rect.y + rect.h - p.y + p.radius;
    const m = Math.min(left, right, top, bottom);
    if (m === left) p.x = rect.x - p.radius;
    else if (m === right) p.x = rect.x + rect.w + p.radius;
    else if (m === top) p.y = rect.y - p.radius;
    else p.y = rect.y + rect.h + p.radius;
  }
}

export function updatePlayer(player, dt, input, solids) {
  const move = input.moveVector();
  player.moving = move.x !== 0 || move.y !== 0;
  player.sprinting = input.sprinting() && player.moving;
  const speed = player.sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;

  player.x += move.x * speed * dt;
  for (const rect of solids) resolveCircleRect(player, rect);
  player.y += move.y * speed * dt;
  for (const rect of solids) resolveCircleRect(player, rect);

  if (player.moving) {
    player.dir = Math.atan2(move.y, move.x);
    if (player.sprinting) player.noiseRing = 0.35;
  }
  if (player.noiseRing > 0) player.noiseRing = Math.max(0, player.noiseRing - dt);
}

// Hold E beside the pedestal to crack the glass case. Returns 'done' the
// frame the case opens, 'working' while the pick is turning, else 'idle'.
export function updateLockpick(player, dt, input) {
  if (player.hasLoot) return 'idle';
  const near = distance(player, PEDESTAL) < PEDESTAL.r + PLAYER.lockpickRange;
  if (!near || !input.lockpickHeld()) {
    player.lockpick = Math.max(0, player.lockpick - dt * 2);
    return 'idle';
  }
  player.lockpick += dt / PLAYER.lockpickSeconds;
  if (player.lockpick >= 1) {
    player.lockpick = 0;
    player.hasLoot = true;
    return 'done';
  }
  return 'working';
}

// Hold E beside the vault plinth to crack the sceptre loose. Slower than
// the case and louder when it opens: 'done' the frame it comes free,
// 'working' while the pick turns, else 'idle'.
export function updateVault(player, dt, input) {
  if (player.hasVault) return 'idle';
  const near = distance(player, VAULT) < VAULT.r + PLAYER.lockpickRange;
  if (!near || !input.lockpickHeld()) {
    player.vaultPick = Math.max(0, player.vaultPick - dt * 2);
    return 'idle';
  }
  player.vaultPick += dt / PLAYER.vaultSeconds;
  if (player.vaultPick >= 1) {
    player.vaultPick = 0;
    player.hasVault = true;
    return 'done';
  }
  return 'working';
}

// Drop a smoke pellet at the thief's feet. Returns true when one was spent.
export function useSmoke(player, smokes) {
  if (player.smokeUses <= 0) return false;
  player.smokeUses -= 1;
  smokes.push({ x: player.x, y: player.y, r: TOOLS.smokeRadius, ttl: TOOLS.smokeSeconds });
  return true;
}

// Fire the EMP. Returns true when one was spent.
export function useEmp(player) {
  if (player.empUses <= 0) return false;
  player.empUses -= 1;
  return true;
}

// True when the thief stands in the exit doorway.
export function atExit(player, exit) {
  return player.x >= exit.x - 10 && player.x <= exit.x + exit.w + 10 &&
    player.y >= exit.y - 10 && player.y <= exit.y + exit.h + 10;
}
