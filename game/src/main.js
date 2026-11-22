// The Meridian Job — game loop and state machine. Boots the world, reads
// the keyboard, steps every system once a frame and hands the world to the
// renderer. Modes: briefing, playing, paused, caught, won. The difficulty
// picked on the briefing screen (1, 2 or 3) survives restarts, so R never
// silently drops the player back to Normal.

import { VIEW, PLAYER, ALARM, TOOLS, SCORE, DIFFICULTY } from './config.js';
import {
  WALLS, CASES, SHADOWS, GUARD_DEFS, CAMERA_DEFS, ENTRY, EXIT, PEDESTAL,
  VAULT, sightBlockers,
} from './level.js';
import { createInput } from './input.js';
import { createGuard, updateGuard, guardTouched } from './guards.js';
import { createCamera, updateCamera, disableAllCameras } from './cameras.js';
import {
  createPlayer, updatePlayer, updateLockpick, updateVault, useSmoke, useEmp, atExit,
} from './player.js';
import { createAlarm, updateAlarm, tripCaseAlarm, tripVaultAlarm, isHunting } from './alarm.js';
import { renderWorld } from './render.js';
import { applyPose } from './poses.js';
import {
  unlockAudio, toggleMute, soundClick, soundPickup, soundSmoke, soundEmp,
  soundSpotted, soundCaught, soundWin,
} from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput();
const blockers = sightBlockers();
const pedestalSolid = { x: PEDESTAL.x - 30, y: PEDESTAL.y - 30, w: 60, h: 60 };
const vaultSolid = { x: VAULT.x - 26, y: VAULT.y - 26, w: 52, h: 52 };
const solids = [...WALLS, ...CASES, pedestalSolid, vaultSolid];

// The difficulty the player picked; createWorld reads it so a restart
// keeps the same job.
let chosenDifficulty = 'normal';

function readBest() {
  try {
    const raw = window.localStorage.getItem('meridian-best');
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem('meridian-best', String(score));
  } catch {
    // Storage can be off; the game plays on without a best score.
  }
}

function applyDifficulty(world) {
  const d = DIFFICULTY[world.difficulty];
  for (const guard of world.guards) {
    guard.speed *= d.guardSpeed;
    guard.huntSpeed *= d.huntSpeed;
    guard.viewRange *= d.viewRange;
  }
  for (const camera of world.cameras) {
    camera.viewRange *= d.viewRange;
  }
  world.alarm.rateMul = d.alarmRate;
}

function createWorld() {
  const world = {
    mode: 'briefing',
    difficulty: chosenDifficulty,
    time: 0,
    player: createPlayer(ENTRY),
    guards: GUARD_DEFS.map(createGuard),
    cameras: CAMERA_DEFS.map(createCamera),
    smokes: [],
    alarm: createAlarm(),
    score: 0,
    objective: 'Reach the Star of Meridian',
    hint: 'Stay out of the cones — shadows hide you',
    posed: false,
    caughtReason: '',
    winBreakdown: null,
    wasSeeing: false,
    everSeen: false,
    best: readBest(),
  };
  applyDifficulty(world);
  return world;
}

let world = createWorld();

// Lets scripted playthroughs and tests read the live state.
window.__meridian = { get world() { return world; } };

// A ?shot=cover|loot|alarm|escape pose stages a real moment for screenshots.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyPose(world, shot);

function toolCosts() {
  const smokeUsed = PLAYER.smokeUses - world.player.smokeUses;
  const empUsed = PLAYER.empUses - world.player.empUses;
  return -(smokeUsed * TOOLS.smokeCost + empUsed * TOOLS.empCost);
}

function refreshScore() {
  world.score = (world.player.hasLoot ? SCORE.diamond : 0) +
    (world.player.hasVault ? SCORE.vault : 0) + toolCosts();
}

function catchThief(reason) {
  world.mode = 'caught';
  world.caughtReason = reason;
  soundCaught();
}

function winJob() {
  const timeBonus = Math.max(
    0,
    SCORE.timeBonusStart - Math.floor(world.time) * SCORE.timeBonusPerSecond,
  );
  const stealth = world.alarm.max < SCORE.stealthAlarmCap ? SCORE.stealthBonus : 0;
  const ghost = !world.everSeen;
  const ghostBonus = ghost ? SCORE.ghostBonus : 0;
  const tools = toolCosts();
  const vault = world.player.hasVault ? SCORE.vault : 0;
  const total = Math.max(0, SCORE.diamond + vault + timeBonus + stealth + ghostBonus + tools);
  const best = Math.max(world.best, total);
  if (total > world.best) saveBest(total);
  world.winBreakdown = {
    diamond: SCORE.diamond,
    vault,
    timeBonus,
    stealth,
    ghost,
    ghostBonus,
    tools,
    total,
    best,
  };
  world.score = total;
  world.mode = 'won';
  soundWin();
}

function update(dt) {
  if (world.mode === 'briefing') {
    // Difficulty first: 1, 2 and 3 pick a job without starting it.
    if (input.wasPressed('Digit1') || input.wasPressed('Numpad1')) {
      chosenDifficulty = 'easy';
      world = createWorld();
      unlockAudio();
      soundClick();
      return;
    }
    if (input.wasPressed('Digit2') || input.wasPressed('Numpad2')) {
      chosenDifficulty = 'normal';
      world = createWorld();
      unlockAudio();
      soundClick();
      return;
    }
    if (input.wasPressed('Digit3') || input.wasPressed('Numpad3')) {
      chosenDifficulty = 'hard';
      world = createWorld();
      unlockAudio();
      soundClick();
      return;
    }
    if (input.anyKey()) {
      unlockAudio();
      soundClick();
      world.mode = 'playing';
    }
    return;
  }

  if (input.wasPressed('KeyM')) toggleMute();

  if (world.mode === 'paused') {
    if (input.wasPressed('KeyP') || input.wasPressed('Escape')) world.mode = 'playing';
    if (input.wasPressed('KeyR')) world = createWorld();
    return;
  }

  if (world.mode === 'caught' || world.mode === 'won') {
    if (input.wasPressed('KeyR')) world = createWorld();
    return;
  }

  // Playing.
  world.time += dt;
  if (input.wasPressed('KeyP') || input.wasPressed('Escape')) {
    world.mode = 'paused';
    input.endFrame();
    return;
  }
  if (input.wasPressed('KeyR')) {
    world = createWorld();
    input.endFrame();
    return;
  }

  // Tools, at a cost to the score.
  if (input.wasPressed('Digit1') && useSmoke(world.player, world.smokes)) {
    soundSmoke();
    refreshScore();
  }
  if (input.wasPressed('Digit2') && useEmp(world.player)) {
    disableAllCameras(world.cameras, TOOLS.empSeconds);
    soundEmp();
    refreshScore();
  }

  updatePlayer(world.player, dt, input, solids);

  // The case: hold E beside the pedestal until the pick turns all the way.
  const pick = updateLockpick(world.player, dt, input);
  if (pick === 'done') {
    tripCaseAlarm(world.alarm);
    soundPickup();
    refreshScore();
    world.objective = 'Get to the service door — or crack the vault (+400)!';
    world.hint = 'The vault hides a second prize — or run for the door';
  } else if (!world.posed && pick === 'working') {
    world.objective = 'Crack the case — hold E';
    world.hint = 'Keep still and keep picking';
  }

  // The vault: hold E at the plinth. Slower than the case, louder too.
  const vault = updateVault(world.player, dt, input);
  if (vault === 'done') {
    tripVaultAlarm(world.alarm);
    soundPickup();
    refreshScore();
    world.objective = 'Get to the service door!';
    world.hint = 'Sceptre secured — move fast';
  } else if (!world.posed && vault === 'working') {
    world.objective = 'Crack the vault — hold E';
    world.hint = 'Voss patrols the vault — time it right';
  } else if (!world.posed && !world.player.hasLoot) {
    world.objective = 'Reach the Star of Meridian';
    world.hint = 'Stay out of the cones — shadows hide you';
  } else if (!world.posed && world.player.hasLoot && !world.player.hasVault) {
    world.objective = 'Get to the service door — or crack the vault (+400)!';
    world.hint = 'The vault hides a second prize — or run for the door';
  }

  // Guards and cameras watch; the strongest view sets the alarm's rise.
  const hot = isHunting(world.alarm);
  let bestSpot = 0;
  let anySeeing = false;
  for (const guard of world.guards) {
    const spot = updateGuard(
      guard, dt, world.player, blockers, SHADOWS, world.smokes, hot,
    );
    bestSpot = Math.max(bestSpot, spot);
    if (guard.seeing) anySeeing = true;
  }
  for (const camera of world.cameras) {
    const spot = updateCamera(
      camera, dt, world.time, world.player, blockers, SHADOWS, world.smokes,
    );
    bestSpot = Math.max(bestSpot, spot);
    if (camera.seeing) anySeeing = true;
  }
  if (anySeeing) world.everSeen = true;
  if (anySeeing && !world.wasSeeing) soundSpotted();
  world.wasSeeing = anySeeing;

  const tripped = updateAlarm(world.alarm, dt, bestSpot, world.player.sprinting);

  // Smoke burns down.
  for (const smoke of world.smokes) smoke.ttl -= dt;
  world.smokes = world.smokes.filter((smoke) => smoke.ttl > 0);

  if (tripped) {
    catchThief('The alarm hit 100% — the gallery locked down.');
  } else if (guardTouched(world.player, world.guards)) {
    catchThief('A guard grabbed you in the open.');
  } else if (world.player.hasLoot && atExit(world.player, EXIT)) {
    winJob();
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  update(dt);
  renderWorld(ctx, world);
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
