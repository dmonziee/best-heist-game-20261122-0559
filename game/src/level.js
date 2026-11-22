// The Meridian Gallery: one room, three ways through it. The layout is data
// only — every wall, display case, shadow patch, camera, guard route, the
// loot pedestal, the entry and the exit live here, so the rest of the game
// never hard-codes a coordinate.
//
// The room is the canvas below the HUD strip. Walls and cases block both
// movement and sight; shadow patches halve how fast detectors fill the alarm.

import { VIEW } from './config.js';

export const ROOM = { x: 48, y: 88, w: 1184, h: 688 };

// Perimeter walls (top, right, bottom, left) plus the interior spine wall
// that splits the hall and forces a choice of route.
export const WALLS = [
  { x: 40, y: 80, w: 1200, h: 20 },
  { x: 40, y: 756, w: 1200, h: 20 },
  { x: 40, y: 80, w: 20, h: 696 },
  { x: 1220, y: 80, w: 20, h: 696 },
  // Spine wall with a gap above and a gap below: the central route goes
  // around either end of it.
  { x: 612, y: 380, w: 24, h: 160 },
];

// Display cases: cover to hide behind, and they block sight lines too.
export const CASES = [
  { x: 300, y: 200, w: 180, h: 90, label: 'JADE' },
  { x: 700, y: 180, w: 200, h: 90, label: 'PORCELAIN' },
  { x: 450, y: 480, w: 220, h: 90, label: 'MANUSCRIPTS' },
  { x: 950, y: 500, w: 160, h: 90, label: 'COINS' },
];

// Dark patches where the spotlights do not reach. A thief standing in one is
// spotted half as fast.
export const SHADOWS = [
  { x: 60, y: 300, w: 160, h: 440 },
  { x: 470, y: 590, w: 180, h: 150 },
  { x: 1060, y: 300, w: 150, h: 150 },
];

// Framed paintings on the walls, decoration only.
export const PAINTINGS = [
  { x: 180, y: 100, w: 90, h: 60, hue: '#7a4a3a' },
  { x: 900, y: 100, w: 90, h: 60, hue: '#3a5a7a' },
  { x: 60, y: 420, w: 60, h: 90, hue: '#4a7a3a' },
  { x: 1180, y: 420, w: 60, h: 90, hue: '#7a3a5a' },
];

// The loot: the Star of Meridian, on its pedestal in the middle of the hall,
// behind a velvet rope. The top corridor stays open for the getaway.
export const PEDESTAL = { x: 500, y: 400, r: 30 };
export const ROPE = { x: 400, y: 340, w: 200, h: 10 };

// Where the thief slips in, and the way out once the diamond is lifted.
export const ENTRY = { x: 92, y: 716 };
export const EXIT = { x: 1176, y: 128, w: 44, h: 64 };

// Guards: name, uniform colour, patrol waypoints, speed. They walk their loop
// and turn at each waypoint.
export const GUARD_DEFS = [
  {
    name: 'Marlow',
    color: '#5a8fd6',
    waypoints: [
      { x: 350, y: 320 },
      { x: 900, y: 320 },
      { x: 900, y: 620 },
      { x: 350, y: 620 },
    ],
    speed: 55,
  },
  {
    name: 'Petra',
    color: '#9a6fd6',
    waypoints: [
      { x: 250, y: 122 },
      { x: 1100, y: 122 },
    ],
    speed: 72,
  },
  {
    name: 'Okafor',
    color: '#4fb3a6',
    waypoints: [
      { x: 1050, y: 320 },
      { x: 1050, y: 660 },
      { x: 850, y: 660 },
      { x: 850, y: 320 },
    ],
    speed: 60,
  },
];

// Wall cameras: position, the arc they sweep, and where the sweep starts.
export const CAMERA_DEFS = [
  { x: 118, y: 104, minAngle: -0.35, maxAngle: 1.25, phase: 0.0 },
  { x: 1162, y: 716, minAngle: 1.95, maxAngle: 3.5, phase: 0.6 },
];

// Everything that blocks sight: walls and cases, as rectangles.
export function sightBlockers() {
  return [...WALLS, ...CASES];
}

// The room's floor, for the renderer.
export function floorRect() {
  return { x: ROOM.x, y: ROOM.y, w: ROOM.w, h: ROOM.h };
}

export const HUD = { height: VIEW.hudHeight };
