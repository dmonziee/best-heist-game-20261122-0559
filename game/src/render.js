// Rendering: everything the player sees, drawn on one canvas. Order
// matters — floor, then vision cones, then walls and cases over the cones
// (so a cone reads as blocked by a wall), then the people and the loot,
// then the HUD.

import { COLORS, VIEW, GUARD, CAMERA, ALARM, DIFFICULTY } from './config.js';
import {
  WALLS, CASES, SHADOWS, PAINTINGS, PEDESTAL, ROPE, VAULT, VAULT_DOOR, ENTRY, EXIT, floorRect,
} from './level.js';

function conePath(ctx, x, y, facing, halfAngle, range) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx) {
  const floor = floorRect();
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(floor.x, floor.y, floor.w, floor.h);
  ctx.strokeStyle = COLORS.floorTile;
  ctx.lineWidth = 1;
  for (let x = floor.x + 74; x < floor.x + floor.w; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, floor.y);
    ctx.lineTo(x, floor.y + floor.h);
    ctx.stroke();
  }
  for (let y = floor.y + 74; y < floor.y + floor.h; y += 74) {
    ctx.beginPath();
    ctx.moveTo(floor.x, y);
    ctx.lineTo(floor.x + floor.w, y);
    ctx.stroke();
  }
  // Accent tiles: small gold diamonds where the grid lines cross.
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.25)';
  for (const x of [222, 518, 814, 1110]) {
    for (const y of [236, 532]) {
      ctx.beginPath();
      ctx.moveTo(x, y - 7);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x - 7, y);
      ctx.closePath();
      ctx.stroke();
    }
  }
  // Red carpet down the middle path, past the spine wall.
  ctx.fillStyle = COLORS.carpet;
  ctx.fillRect(644, 100, 52, 656);
  ctx.strokeStyle = COLORS.carpetEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(644, 100);
  ctx.lineTo(644, 756);
  ctx.moveTo(696, 100);
  ctx.lineTo(696, 756);
  ctx.stroke();
  // Shadow patches: darker floor where the spotlights do not reach.
  for (const s of SHADOWS) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = 'rgba(120, 140, 180, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w, s.h);
  }
}

function drawCones(ctx, guards, cameras) {
  for (const guard of guards) {
    ctx.fillStyle = guard.seeing ? COLORS.guardConeHot : COLORS.guardCone;
    conePath(ctx, guard.x, guard.y, guard.facing, GUARD.viewHalfAngle, guard.viewRange);
    ctx.fill();
  }
  for (const camera of cameras) {
    if (camera.disabledLeft > 0) continue;
    ctx.fillStyle = COLORS.cameraCone;
    conePath(ctx, camera.x, camera.y, camera.angle, CAMERA.viewHalfAngle, camera.viewRange);
    ctx.fill();
  }
}

function drawWalls(ctx) {
  for (const wall of WALLS) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
  }
  // Paintings on the walls.
  for (const p of PAINTINGS) {
    ctx.fillStyle = '#5a4632';
    ctx.fillRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
    ctx.fillStyle = p.hue;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.fillRect(p.x, p.y, p.w, 10);
  }
  // The service door (exit) and the entry door.
  ctx.fillStyle = '#1d5c33';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#2f8f4e';
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2);
  ctx.fillStyle = '#3a4767';
  ctx.fillRect(ENTRY.x - 22, ENTRY.y - 32, 44, 64);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '11px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('IN', ENTRY.x, ENTRY.y);
}

function drawCases(ctx) {
  for (const c of CASES) {
    ctx.fillStyle = COLORS.caseFrame;
    ctx.fillRect(c.x - 4, c.y - 4, c.w + 8, c.h + 8);
    ctx.fillStyle = COLORS.caseGlass;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    // Warm spotlight on each case.
    const glow = ctx.createRadialGradient(
      c.x + c.w / 2, c.y + c.h / 2, 8, c.x + c.w / 2, c.y + c.h / 2, c.w * 0.6,
    );
    glow.addColorStop(0, 'rgba(242, 193, 78, 0.14)');
    glow.addColorStop(1, 'rgba(242, 193, 78, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = COLORS.dimText;
    ctx.font = '11px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2);
  }
  // Velvet rope in front of the pedestal.
  ctx.strokeStyle = COLORS.rope;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(ROPE.x, ROPE.y);
  ctx.lineTo(ROPE.x + ROPE.w, ROPE.y);
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(ROPE.x, ROPE.y, 5, 0, Math.PI * 2);
  ctx.arc(ROPE.x + ROPE.w, ROPE.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPedestal(ctx, hasLoot, time) {
  ctx.fillStyle = '#2a3348';
  ctx.beginPath();
  ctx.arc(PEDESTAL.x, PEDESTAL.y, PEDESTAL.r + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#46557a';
  ctx.beginPath();
  ctx.arc(PEDESTAL.x, PEDESTAL.y, PEDESTAL.r, 0, Math.PI * 2);
  ctx.fill();
  if (!hasLoot) {
    // The Star of Meridian, pulsing gently.
    const pulse = 0.75 + Math.sin(time * 3) * 0.25;
    ctx.save();
    ctx.shadowColor = COLORS.diamond;
    ctx.shadowBlur = 22 * pulse;
    ctx.fillStyle = COLORS.diamond;
    ctx.beginPath();
    ctx.moveTo(PEDESTAL.x, PEDESTAL.y - 16);
    ctx.lineTo(PEDESTAL.x + 11, PEDESTAL.y);
    ctx.lineTo(PEDESTAL.x, PEDESTAL.y + 16);
    ctx.lineTo(PEDESTAL.x - 11, PEDESTAL.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(PEDESTAL.x - 3, PEDESTAL.y - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVault(ctx, hasVault, time) {
  // The vault's name over its top wall, and gold posts framing the door.
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VAULT', 1095, 602);
  ctx.fillRect(VAULT_DOOR.x - 2, VAULT_DOOR.y - 6, VAULT_DOOR.w + 4, 8);
  ctx.fillRect(VAULT_DOOR.x - 2, VAULT_DOOR.y + VAULT_DOOR.h - 2, VAULT_DOOR.w + 4, 8);
  // The plinth.
  ctx.fillStyle = '#2a3348';
  ctx.beginPath();
  ctx.arc(VAULT.x, VAULT.y, VAULT.r + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a3a6e';
  ctx.beginPath();
  ctx.arc(VAULT.x, VAULT.y, VAULT.r, 0, Math.PI * 2);
  ctx.fill();
  if (!hasVault) {
    // The Meridian Sceptre: a staff with a glowing orb, pulsing gently.
    const pulse = 0.75 + Math.sin(time * 3 + 1) * 0.25;
    ctx.save();
    ctx.shadowColor = COLORS.sceptre;
    ctx.shadowBlur = 20 * pulse;
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(VAULT.x, VAULT.y + 14);
    ctx.lineTo(VAULT.x, VAULT.y - 10);
    ctx.stroke();
    ctx.fillStyle = COLORS.sceptre;
    ctx.beginPath();
    ctx.arc(VAULT.x, VAULT.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(VAULT.x - 2, VAULT.y - 17, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmoke(ctx, smokes) {
  for (const s of smokes) {
    const alpha = Math.min(1, s.ttl / 2) * 0.9;
    ctx.fillStyle = `rgba(190, 200, 215, ${0.34 * alpha + 0.1})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 228, 240, ${0.25 * alpha})`;
    ctx.beginPath();
    ctx.arc(s.x - s.r * 0.35, s.y - s.r * 0.2, s.r * 0.45, 0, Math.PI * 2);
    ctx.arc(s.x + s.r * 0.3, s.y + s.r * 0.25, s.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    ctx.fillStyle = guard.color;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
    ctx.fill();
    // Cap brim and facing tick.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, GUARD.radius - 4, guard.facing - 0.9, guard.facing + 0.9);
    ctx.lineTo(guard.x, guard.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(
      guard.x + Math.cos(guard.facing) * (GUARD.radius + 6),
      guard.y + Math.sin(guard.facing) * (GUARD.radius + 6),
    );
    ctx.stroke();
    if (guard.seeing) {
      ctx.fillStyle = '#ff5a4e';
      ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('!', guard.x, guard.y - GUARD.radius - 4);
    }
    if (guard.state === 'hunt') {
      ctx.fillStyle = '#ff5a4e';
      ctx.font = 'bold 11px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HUNT', guard.x, guard.y + GUARD.radius + 14);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const camera of cameras) {
    const off = camera.disabledLeft > 0;
    ctx.fillStyle = off ? '#3a4152' : '#c94a56';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = off ? '#20242e' : '#ffd9dc';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (off) {
      ctx.strokeStyle = '#8b96ad';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(camera.x - 6, camera.y - 6);
      ctx.lineTo(camera.x + 6, camera.y + 6);
      ctx.moveTo(camera.x + 6, camera.y - 6);
      ctx.lineTo(camera.x - 6, camera.y + 6);
      ctx.stroke();
    }
  }
}

function drawPlayer(ctx, player, time) {
  // Sprint noise ring.
  if (player.noiseRing > 0) {
    ctx.strokeStyle = `rgba(232, 228, 216, ${player.noiseRing})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + (0.35 - player.noiseRing) * 120, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#1f7a6d';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  // Hood point in the facing direction.
  ctx.fillStyle = '#155e54';
  ctx.beginPath();
  ctx.moveTo(
    player.x + Math.cos(player.dir) * (player.radius + 8),
    player.y + Math.sin(player.dir) * (player.radius + 8),
  );
  ctx.lineTo(
    player.x + Math.cos(player.dir + 2.5) * player.radius,
    player.y + Math.sin(player.dir + 2.5) * player.radius,
  );
  ctx.lineTo(
    player.x + Math.cos(player.dir - 2.5) * player.radius,
    player.y + Math.sin(player.dir - 2.5) * player.radius,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8e4d8';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 4, 0, Math.PI * 2);
  ctx.fill();
  // The lifted diamond rides on the thief, and the sceptre beside it.
  if (player.hasLoot) {
    const bob = Math.sin(time * 4) * 2;
    ctx.fillStyle = COLORS.diamond;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 24 + bob);
    ctx.lineTo(player.x + 6, player.y - 18 + bob);
    ctx.lineTo(player.x, player.y - 12 + bob);
    ctx.lineTo(player.x - 6, player.y - 18 + bob);
    ctx.closePath();
    ctx.fill();
  }
  if (player.hasVault) {
    ctx.fillStyle = COLORS.sceptre;
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lockpick progress ring, and a violet one for the vault crack.
  if (player.lockpick > 0 && player.lockpick < 1) {
    ctx.strokeStyle = 'rgba(232, 228, 216, 0.35)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 10, -Math.PI / 2, -Math.PI / 2 + player.lockpick * Math.PI * 2);
    ctx.stroke();
  }
  if (player.vaultPick > 0 && player.vaultPick < 1) {
    ctx.strokeStyle = 'rgba(232, 228, 216, 0.35)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.sceptre;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius + 10, -Math.PI / 2, -Math.PI / 2 + player.vaultPick * Math.PI * 2);
    ctx.stroke();
  }
}

function alarmColor(value) {
  if (value >= ALARM.huntAt) return '#e85460';
  if (value >= ALARM.calmBelow) return '#f2a54e';
  return '#5ec97a';
}

function drawHud(ctx, world) {
  ctx.fillStyle = COLORS.hudBack;
  ctx.fillRect(0, 0, VIEW.width, VIEW.hudHeight);
  ctx.strokeStyle = COLORS.hudLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, VIEW.hudHeight + 0.5);
  ctx.lineTo(VIEW.width, VIEW.hudHeight + 0.5);
  ctx.stroke();

  ctx.textBaseline = 'middle';
  // Alarm meter.
  ctx.fillStyle = COLORS.dimText;
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', 20, 24);
  ctx.fillStyle = '#20242e';
  roundRect(ctx, 20, 36, 260, 14, 7);
  ctx.fill();
  ctx.fillStyle = alarmColor(world.alarm.value);
  const alarmW = Math.max(0, (world.alarm.value / ALARM.max) * 260);
  if (alarmW > 0) {
    roundRect(ctx, 20, 36, alarmW, 14, 7);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`${Math.round(world.alarm.value)}%`, 292, 43);

  // Objective.
  ctx.fillStyle = COLORS.text;
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.objective, VIEW.width / 2, 26);
  ctx.fillStyle = COLORS.dimText;
  ctx.font = '12px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(world.hint, VIEW.width / 2, 46);

  // Loot, tools, timer, score, difficulty.
  const mins = Math.floor(world.time / 60);
  const secs = Math.floor(world.time % 60);
  ctx.textAlign = 'right';
  const lootText = world.player.hasVault
    ? '◆ LOOT + VAULT SECURED'
    : world.player.hasLoot ? '◆ LOOT SECURED' : '◇ LOOT: THE STAR';
  ctx.fillStyle = world.player.hasLoot ? COLORS.gold : COLORS.dimText;
  ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(lootText, VIEW.width - 20, 20);
  ctx.fillStyle = COLORS.text;
  ctx.font = '13px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(
    `smoke ${world.player.smokeUses} · EMP ${world.player.empUses} · ${mins}:${String(secs).padStart(2, '0')} · SCORE ${world.score} · ${DIFFICULTY[world.difficulty].label}`,
    VIEW.width - 20,
    44,
  );
}

function drawPanel(ctx, title, lines, accent) {
  const w = 620;
  const h = 150 + lines.length * 26;
  const x = (VIEW.width - w) / 2;
  const y = 200;
  ctx.fillStyle = 'rgba(10, 13, 20, 0.88)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW.width / 2, y + 44);
  ctx.fillStyle = COLORS.text;
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW.width / 2, y + 92 + i * 26);
  });
}

export function renderWorld(ctx, world) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx);
  drawCones(ctx, world.guards, world.cameras);
  drawWalls(ctx);
  drawCases(ctx);
  drawPedestal(ctx, world.player.hasLoot, world.time);
  drawVault(ctx, world.player.hasVault, world.time);
  drawSmoke(ctx, world.smokes);
  drawCameras(ctx, world.cameras);
  drawGuards(ctx, world.guards);
  drawPlayer(ctx, world.player, world.time);
  drawHud(ctx, world);

  // Red vignette while the alarm runs hot.
  if (world.alarm.value >= ALARM.huntAt && world.mode === 'playing') {
    const pulse = 0.10 + Math.sin(world.time * 6) * 0.05;
    const grad = ctx.createRadialGradient(
      VIEW.width / 2, VIEW.height / 2, 300, VIEW.width / 2, VIEW.height / 2, 720,
    );
    grad.addColorStop(0, 'rgba(232, 84, 96, 0)');
    grad.addColorStop(1, `rgba(232, 84, 96, ${pulse})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }

  if (world.mode === 'briefing') {
    drawPanel(ctx, 'THE MERIDIAN JOB', [
      'Slip past the guards and the cameras. Lift the Star of Meridian.',
      'Get out the service door before the alarm hits 100%.',
      'WASD move · Shift sprint · hold E to crack the case · 1 smoke · 2 EMP',
      `Difficulty ${DIFFICULTY[world.difficulty].label} — press 1 Easy, 2 Normal, 3 Hard to change`,
      'Press any key to begin the job.',
    ], COLORS.gold);
  } else if (world.mode === 'paused') {
    drawPanel(ctx, 'PAUSED', ['Press P to keep going.', 'Press R to restart the job.'], COLORS.dimText);
  } else if (world.mode === 'caught') {
    drawPanel(ctx, 'CAUGHT!', [
      world.caughtReason,
      `Score ${world.score} · time ${Math.floor(world.time)}s`,
      'Press R to run it again.',
    ], '#e85460');
  } else if (world.mode === 'won') {
    const b = world.winBreakdown;
    const lines = [
      `Diamond ${b.diamond} · vault ${b.vault} · time ${b.timeBonus} · stealth ${b.stealth} · tools ${b.tools}`,
      `TOTAL SCORE ${b.total}`,
    ];
    if (b.ghost) lines.push(`GHOST — never spotted · +${b.ghostBonus}`);
    if (b.best) lines.push(`Best score ${b.best}`);
    lines.push('Press R to run it again.');
    drawPanel(ctx, b.ghost ? 'GETAWAY CLEAN · GHOST' : 'GETAWAY CLEAN', lines, COLORS.gold);
  }
}
