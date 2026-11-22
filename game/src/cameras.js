// Wall cameras: fixed sentries that sweep their cone back and forth. An
// EMP pulse blinds them for a while; while blind they watch nothing and
// their lens goes dark. Each camera carries its own view range so the
// difficulty setting can scale it.

import { CAMERA } from './config.js';
import { coneSees, insideShadow, insideSmoke } from './vision.js';

export function createCamera(def) {
  return {
    x: def.x,
    y: def.y,
    minAngle: def.minAngle,
    maxAngle: def.maxAngle,
    phase: def.phase,
    angle: def.minAngle,
    viewRange: CAMERA.viewRange,
    disabledLeft: 0,
    seeing: false,
    spot: 0,
  };
}

export function updateCamera(camera, dt, time, player, blockers, shadows, smokes) {
  // Sweep: a slow sine between the arc's ends, so the cone never sits still.
  const t = time / CAMERA.sweepSeconds + camera.phase * Math.PI * 2;
  const s = (Math.sin(t) + 1) / 2;
  camera.angle = camera.minAngle + (camera.maxAngle - camera.minAngle) * s;

  if (camera.disabledLeft > 0) {
    camera.disabledLeft = Math.max(0, camera.disabledLeft - dt);
    camera.seeing = false;
    camera.spot = 0;
    return 0;
  }

  let spot = 0;
  if (!insideSmoke(player, smokes)) {
    spot = coneSees(
      camera, camera.angle, camera.viewRange, CAMERA.viewHalfAngle, player, blockers,
    );
    if (spot > 0 && insideShadow(player, shadows)) spot *= 0.5;
  }
  camera.seeing = spot > 0;
  camera.spot = spot;
  return spot;
}

export function disableAllCameras(cameras, seconds) {
  for (const camera of cameras) camera.disabledLeft = seconds;
}
