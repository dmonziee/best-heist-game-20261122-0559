// Sight: the shared test every detector uses. A target is seen when it is
// inside the cone (range and angle) and the line between watcher and target
// is not cut by a wall or a display case.

export function angleTo(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function pointInRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function segmentHitsRect(a, b, r) {
  if (pointInRect(a, r) || pointInRect(b, r)) return true;
  const corners = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  return corners.some(([x1, y1, x2, y2]) =>
    segmentsCross(a.x, a.y, b.x, b.y, x1, y1, x2, y2),
  );
}

// True when nothing solid stands between watcher and target.
export function hasLineOfSight(from, to, blockers) {
  return !blockers.some((rect) => segmentHitsRect(from, to, rect));
}

// True when the target sits inside the watcher's cone and is visible.
// Returns 0 when unseen, otherwise a 0..1 closeness (1 = right on top).
export function coneSees(watcher, facing, range, halfAngle, target, blockers) {
  const d = distance(watcher, target);
  if (d > range) return 0;
  if (angleDiff(angleTo(watcher, target), facing) > halfAngle) return 0;
  if (!hasLineOfSight(watcher, target, blockers)) return 0;
  return 1 - d / range;
}

// True when the point sits inside any smoke cloud.
export function insideSmoke(point, smokes) {
  return smokes.some((s) => distance(point, s) < s.r);
}

// True when the point sits inside a shadow patch.
export function insideShadow(point, shadows) {
  return shadows.some((s) =>
    point.x >= s.x && point.x <= s.x + s.w &&
    point.y >= s.y && point.y <= s.y + s.h,
  );
}
