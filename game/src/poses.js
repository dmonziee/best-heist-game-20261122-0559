// Screenshot poses: staged states of the game for the entry's
// screenshots. Each pose sets the world to a real, playable moment — the
// cover frame shows the whole room at once (thief, guards with cones,
// cameras, loot, alarm meter), and the others show the job's beats: the
// crack, the alarm, the getaway. The game keeps running from the pose,
// so every shot is a render of the game's own code, never a still image.

import { ALARM, SCORE } from './config.js';

function setGuardPose(guard, x, y, facing, waypointIndex, state, lastSeen) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.waypointIndex = waypointIndex;
  guard.state = state;
  guard.lastSeen = lastSeen || null;
  guard.seeing = false;
  guard.spot = 0;
}

export function applyPose(world, name) {
  const { player, guards, cameras, alarm } = world;
  world.smokes.length = 0;
  world.mode = 'playing';
  // A posed world keeps the objective its pose sets; the loop must not
  // overwrite it on the first frame.
  world.posed = true;

  if (name === 'cover') {
    // The whole job in one frame: thief in the shadow by the entry,
    // guards mid-patrol with their cones out, cameras sweeping, the
    // diamond glowing — and the vault annex open at the bottom right,
    // Voss on its beat and the sceptre waiting.
    player.x = 300;
    player.y = 620;
    player.dir = -0.6;
    setGuardPose(guards[0], 700, 320, 0, 1, 'patrol');
    setGuardPose(guards[1], 650, 122, Math.PI, 1, 'patrol');
    setGuardPose(guards[2], 1080, 430, Math.PI / 2, 1, 'patrol');
    setGuardPose(guards[3], 1040, 690, Math.PI, 0, 'patrol');
    setGuardPose(guards[4], 1150, 450, Math.PI / 2, 1, 'patrol');
    alarm.value = 0;
    alarm.max = 0;
    world.time = 12;
    world.score = 0;
    player.hasLoot = false;
    player.hasVault = false;
    world.objective = 'Reach the Star of Meridian';
    world.hint = 'Stay out of the cones — shadows hide you';
  } else if (name === 'loot') {
    // The crack: the thief at the pedestal, the pick turning, a guard's
    // cone sweeping close and the alarm already climbing.
    player.x = 500;
    player.y = 460;
    player.dir = -Math.PI / 2;
    player.lockpick = 0.62;
    setGuardPose(guards[0], 560, 330, Math.PI * 0.7, 3, 'patrol');
    setGuardPose(guards[1], 420, 122, 0, 0, 'patrol');
    setGuardPose(guards[2], 1080, 430, Math.PI / 2, 1, 'patrol');
    setGuardPose(guards[3], 1040, 660, 0, 0, 'patrol');
    setGuardPose(guards[4], 1150, 300, Math.PI / 2, 0, 'patrol');
    alarm.value = 35;
    alarm.max = 35;
    world.time = 48;
    world.score = 0;
    player.hasLoot = false;
    player.hasVault = false;
    world.objective = 'Crack the case — hold E';
    world.hint = 'That cone is getting closer…';
  } else if (name === 'alarm') {
    // The alarm: the thief has the diamond and is burning a smoke pellet
    // in the shadow below the manuscripts case while a guard hunts the
    // last seen spot and the meter sits at 78.
    player.x = 500;
    player.y = 620;
    player.dir = Math.PI / 2;
    player.hasLoot = true;
    player.hasVault = false;
    world.smokes.push({ x: 500, y: 620, r: 95, ttl: 4 });
    setGuardPose(guards[0], 700, 320, 0, 1, 'patrol');
    setGuardPose(guards[1], 560, 420, Math.PI * 0.6, 1, 'hunt', { x: 500, y: 620 });
    setGuardPose(guards[2], 900, 620, -Math.PI / 2, 2, 'patrol');
    setGuardPose(guards[3], 1040, 700, Math.PI, 0, 'patrol');
    setGuardPose(guards[4], 1150, 560, -Math.PI / 2, 1, 'patrol');
    alarm.value = 78;
    alarm.max = 78;
    world.time = 96;
    world.score = SCORE.diamond;
    world.objective = 'Get to the service door!';
    world.hint = 'Smoke buys seconds, not safety';
  } else if (name === 'escape') {
    // The getaway: the thief at the service door, diamond in hand, the
    // job done — and the vault cracked too, for the full score.
    player.x = 1160;
    player.y = 150;
    player.dir = -Math.PI / 2;
    player.hasLoot = true;
    player.hasVault = true;
    setGuardPose(guards[0], 620, 620, Math.PI, 2, 'patrol');
    setGuardPose(guards[1], 300, 122, 0, 0, 'patrol');
    setGuardPose(guards[2], 1050, 430, Math.PI / 2, 1, 'patrol');
    setGuardPose(guards[3], 1040, 680, 0, 0, 'patrol');
    setGuardPose(guards[4], 1150, 400, Math.PI, 0, 'patrol');
    alarm.value = 18;
    alarm.max = 42;
    world.time = 132;
    world.score = SCORE.diamond + 400;
    world.winBreakdown = {
      diamond: SCORE.diamond,
      vault: 400,
      timeBonus: 336,
      stealth: SCORE.stealthBonus,
      ghost: false,
      ghostBonus: 0,
      tools: 0,
      total: 2036,
      best: 2036,
    };
    world.objective = 'Getaway clean';
    world.hint = '';
    world.mode = 'won';
  }

  // Cameras keep their sweep from the world's clock.
  for (const camera of cameras) camera.disabledLeft = 0;
}
