// ORBITLAB — Momentum Invariants
// Linear Momentum P = m1*v1 + m2*v2
// Angular Momentum L = m1*(r1 x v1) + m2*(r2 x v2)

import type { CelestialBody, Vector3D } from './physics-types';
import { vec3 } from './vector3';

export interface MomentumResult {
  linearMomentum: Vector3D;
  linearMomentumMagnitude: number;
  angularMomentum: Vector3D;
  angularMomentumMagnitude: number;
}

export function calculateSystemMomentum(
  body1: CelestialBody,
  body2: CelestialBody
): MomentumResult {
  // Linear momentum P = m1*v1 + m2*v2
  const p1 = vec3.scale(body1.velocity, body1.mass);
  const p2 = vec3.scale(body2.velocity, body2.mass);
  const linearMomentum = vec3.add(p1, p2);
  const linearMomentumMagnitude = vec3.length(linearMomentum);

  // Angular momentum L = m1*(r1 x v1) + m2*(r2 x v2)
  const l1 = vec3.scale(vec3.cross(body1.position, body1.velocity), body1.mass);
  const l2 = vec3.scale(vec3.cross(body2.position, body2.velocity), body2.mass);
  const angularMomentum = vec3.add(l1, l2);
  const angularMomentumMagnitude = vec3.length(angularMomentum);

  return {
    linearMomentum,
    linearMomentumMagnitude,
    angularMomentum,
    angularMomentumMagnitude,
  };
}
