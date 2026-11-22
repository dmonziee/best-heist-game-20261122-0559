// The Meridian Job — tuning and look. Every number the game reads lives
// in this one file, so a balance change is a one-line change here and
// nothing else needs to know the value, only the name.

export const VIEW = { width: 1280, height: 800, hudHeight: 64 };

export const PLAYER = {
  radius: 14,
  walkSpeed: 155,
  sprintSpeed: 235,
  lockpickSeconds: 2.5,
  lockpickRange: 64,
  vaultSeconds: 4,
  smokeUses: 2,
  empUses: 1,
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 55,
  huntSpeed: 98,
  viewRange: 205,
  viewHalfAngle: (38 * Math.PI) / 180,
  touchRange: 28,
};

export const CAMERA = {
  viewRange: 265,
  viewHalfAngle: (30 * Math.PI) / 180,
  sweepSeconds: 5.2,
};

export const ALARM = {
  max: 100,
  huntAt: 70,
  calmBelow: 30,
  decayPerSecond: 11,
  // How fast the meter climbs, per second, on a perfect sighting.
  spotRate: 30,
  // A thief in a shadow patch is half as easy to spot.
  shadowFactor: 0.5,
  // Sprinting is loud: detectors fill the meter faster.
  sprintFactor: 1.5,
  // Cracking the glass case trips its own alarm.
  caseTrip: 15,
  // Cracking the vault trips a bigger one.
  vaultTrip: 25,
};

// Difficulty, picked on the briefing screen with 1, 2 or 3. Each entry
// scales guard walk and hunt speed, how far guards and cameras see, and
// how fast a sighting fills the alarm. Normal is the job as first built.
export const DIFFICULTY = {
  easy: { label: 'EASY', guardSpeed: 0.8, huntSpeed: 0.85, viewRange: 0.9, alarmRate: 0.75 },
  normal: { label: 'NORMAL', guardSpeed: 1, huntSpeed: 1, viewRange: 1, alarmRate: 1 },
  hard: { label: 'HARD', guardSpeed: 1.18, huntSpeed: 1.15, viewRange: 1.12, alarmRate: 1.3 },
};

export const TOOLS = {
  smokeRadius: 95,
  smokeSeconds: 5,
  smokeCost: 100,
  empSeconds: 8,
  empCost: 150,
};

export const SCORE = {
  diamond: 1000,
  vault: 400,
  stealthBonus: 300,
  stealthAlarmCap: 50,
  ghostBonus: 150,
  timeBonusStart: 600,
  timeBonusPerSecond: 2,
};

export const COLORS = {
  floor: '#171c28',
  floorTile: '#1b2130',
  shadow: '#10141f',
  wall: '#2b3550',
  wallTop: '#3a4767',
  caseGlass: '#233246',
  caseFrame: '#8a6d3b',
  rope: '#a3333d',
  carpet: '#6e222c',
  carpetEdge: '#8a2f3a',
  gold: '#f2c14e',
  diamond: '#bfe9ff',
  sceptre: '#c9a7ff',
  guardCone: 'rgba(242, 193, 78, 0.20)',
  guardConeHot: 'rgba(242, 120, 60, 0.30)',
  cameraCone: 'rgba(232, 84, 96, 0.20)',
  smoke: 'rgba(190, 200, 215, 0.34)',
  hudBack: '#0c0f16',
  hudLine: '#2a3348',
  text: '#e8e4d8',
  dimText: '#8b96ad',
};
