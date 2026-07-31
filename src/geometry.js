export const EPSILON = 1e-9;

export function point(x, y) {
  return { x: Number(x), y: Number(y) };
}

export function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function midpoint(a, b) {
  return point((a.x + b.x) / 2, (a.y + b.y) / 2);
}

export function vector(a, b) {
  return point(b.x - a.x, b.y - a.y);
}

export function dot(u, v) {
  return u.x * v.x + u.y * v.y;
}

export function cross(u, v) {
  return u.x * v.y - u.y * v.x;
}

export function normalize(v) {
  const length = Math.hypot(v.x, v.y);
  if (length < EPSILON) return point(0, 0);
  return point(v.x / length, v.y / length);
}

export function projectPointToLine(p, a, b) {
  const ab = vector(a, b);
  const denominator = dot(ab, ab);
  if (denominator < EPSILON) return point(a.x, a.y);
  const t = dot(vector(a, p), ab) / denominator;
  return point(a.x + ab.x * t, a.y + ab.y * t);
}

export function lineIntersection(a, b, c, d) {
  const r = vector(a, b);
  const s = vector(c, d);
  const denominator = cross(r, s);
  if (Math.abs(denominator) < EPSILON) return null;
  const t = cross(vector(a, c), s) / denominator;
  return point(a.x + t * r.x, a.y + t * r.y);
}

export function circleCenterRadius(center, edge) {
  return { center, radius: distance(center, edge) };
}

export function snapPoint(p, gridSize) {
  if (!gridSize || gridSize <= 0) return point(p.x, p.y);
  return point(
    Math.round(p.x / gridSize) * gridSize,
    Math.round(p.y / gridSize) * gridSize,
  );
}
