// The Meridian Job — game loop and state machine. Boots the world, reads the
// keyboard, steps every system once a frame and hands the world to the
// renderer. Modes: briefing, playing, paused, caught, won.

import { VIEW, PLAYER, ALARM, TOOLS, SCORE } from './config.js';
import {
  WALLS, CASES, SHADOWS, GUARD_DEFS, CAMERA_DEFS, ENTRY, EXIT, PEDESTAL, sightBlockers,
} from './level.js';
import { createInput } from './input.js';
import { createGuard, updateGuard, guardTouched } from './guards.js';
import { createCamera, updateCamera, disableAllCameras } from './cameras.js';
import {
  createPlayer, updatePlayer, updateLockpick, useSmoke, useEmp, atExit,
} from './player.js';
import { createAlarm, updateAlarm, tripCaseAlarm, isHunting } from './alarm.js';
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
const solids = [...WALLS, ...CASES, pedestalSolid];

function createWorld() {
  return {
    mode: 'briefing',
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
  };
}

let world = createWorld();

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
  world.score = (world.player.hasLoot ? SCORE.diamond : 0) + toolCosts();
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
  const tools = toolCosts();
  world.winBreakdown = {
    diamond: SCORE.diamond,
    timeBonus,
    stealth,
    tools,
    total: Math.max(0, SCORE.diamond + timeBonus + stealth + tools),
  };
  world.score = world.winBreakdown.total;
  world.mode = 'won';
  soundWin();
}

function update(dt) {
  if (world.mode === 'briefing') {
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
    world.objective = 'Get to the service door!';
    world.hint = 'The case alarm tripped — move fast';
  } else if (!world.posed && pick === 'working') {
    world.objective = 'Crack the case — hold E';
    world.hint = 'Keep still and keep picking';
  } else if (!world.posed && !world.player.hasLoot) {
    world.objective = 'Reach the Star of Meridian';
    world.hint = 'Stay out of the cones — shadows hide you';
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
